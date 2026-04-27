import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Platform,
  TextInput,
  ImageBackground,
} from "react-native";

import { fetch } from "expo/fetch";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";

import {
  useCreateOpenaiConversation,
  useListOpenaiConversations,
  useListOpenaiMessages,
  getListOpenaiConversationsQueryKey,
  getListOpenaiMessagesQueryKey,
} from "@workspace/api-client-react";

import { useColors } from "@/hooks/useColors";
import { MessageBubble } from "@/components/MessageBubble";
import { TypingIndicator } from "@/components/TypingIndicator";
import { ChatInput } from "@/components/ChatInput";

const parisBg = require("@/assets/images/paris-bg.png");

interface LocalMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

let messageCounter = 0;
function generateId(): string {
  messageCounter++;
  return `msg-${Date.now()}-${messageCounter}-${Math.random().toString(36).substr(2, 9)}`;
}

export default function ChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const createConversation = useCreateOpenaiConversation();
  const inputRef = useRef<TextInput>(null);
  const initializedRef = useRef(false);
  const creatingRef = useRef(false);

  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showTyping, setShowTyping] = useState(false);

  const { data: conversations = [], isLoading: isLoadingConvList } = useListOpenaiConversations();

  const currentConversationId = conversations.length > 0 ? conversations[0].id : undefined;

  const { data: serverMessages } = useListOpenaiMessages(
    currentConversationId as number,
    { query: { enabled: !!currentConversationId } }
  );

  useEffect(() => {
    if (!isLoadingConvList && conversations.length === 0 && !creatingRef.current) {
      creatingRef.current = true;
      createConversation.mutate(
        { data: { title: "My Paris Trip" } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
            creatingRef.current = false;
          },
          onError: () => {
            creatingRef.current = false;
          },
        }
      );
    }
  }, [isLoadingConvList, conversations.length]);

  useEffect(() => {
    initializedRef.current = false;
    setMessages([]);
  }, [currentConversationId]);

  useEffect(() => {
    if (serverMessages && !initializedRef.current) {
      setMessages(
        serverMessages.map((m) => ({
          id: String(m.id),
          role: m.role as "user" | "assistant",
          content: m.content,
        }))
      );
      initializedRef.current = true;
    }
  }, [serverMessages]);

  const handleSend = async (text: string) => {
    if (isStreaming || !currentConversationId) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const domain = process.env.EXPO_PUBLIC_DOMAIN;
    const userMsg: LocalMessage = { id: generateId(), role: "user", content: text };

    setMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);
    setShowTyping(true);

    try {
      const response = await fetch(
        `https://${domain}/api/openai/conversations/${currentConversationId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
          },
          body: JSON.stringify({ content: text }),
        }
      );

      if (!response.ok) throw new Error("Failed to get response");
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let fullContent = "";
      let buffer = "";
      let assistantAdded = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              fullContent += parsed.content;
              if (!assistantAdded) {
                setShowTyping(false);
                setMessages((prev) => [
                  ...prev,
                  { id: generateId(), role: "assistant", content: fullContent },
                ]);
                assistantAdded = true;
              } else {
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    ...updated[updated.length - 1],
                    content: fullContent,
                  };
                  return updated;
                });
              }
            }
            if (parsed.done) break;
          } catch {}
        }
      }
    } catch {
      setShowTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsStreaming(false);
      setShowTyping(false);
      queryClient.invalidateQueries({
        queryKey: getListOpenaiMessagesQueryKey(currentConversationId),
      });
    }
  };

  const reversedMessages = [...messages].reverse();
  const topPad = insets.top + (Platform.OS === "web" ? 47 : 0);
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 16;

  return (
    <ImageBackground
      source={parisBg}
      style={[styles.container, { backgroundColor: colors.background }]}
      imageStyle={styles.bgImage}
      resizeMode="cover"
    >
    <KeyboardAvoidingView
      style={styles.flex}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 12,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>L'Itinéraire</Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>Paris Concierge</Text>
        </View>
      </View>

      <FlatList
        data={reversedMessages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MessageBubble message={item} />}
        inverted={messages.length > 0}
        scrollEnabled={messages.length > 0}
        ListHeaderComponent={showTyping ? <TypingIndicator /> : null}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          messages.length === 0 ? [styles.emptyContainer] : styles.listContent
        }
        ListEmptyComponent={
          <View style={styles.welcome}>
            <View
              style={[styles.welcomeIcon, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Text style={[styles.welcomeIconText, { color: colors.primary }]}>B</Text>
            </View>
            <Text style={[styles.welcomeTitle, { color: colors.foreground }]}>Bonjour!</Text>
            <Text style={[styles.welcomeText, { color: colors.mutedForeground }]}>
              I'm your personal Paris concierge. Tell me about your dream trip — when you're
              traveling, what you love, and what you'd like to experience.
            </Text>
          </View>
        }
      />

      <View style={{ paddingBottom: bottomPad }}>
        <ChatInput ref={inputRef} onSend={handleSend} disabled={isStreaming || !currentConversationId} />
        <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>
          AI concierge · Verify recommendations before booking
        </Text>
      </View>
    </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  bgImage: {
    opacity: 0.15,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 12,
    fontWeight: "500" as const,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 1,
  },
  listContent: {
    paddingVertical: 12,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  welcome: {
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  welcomeIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: "#2C251B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  welcomeIconText: {
    fontSize: 32,
    fontWeight: "600" as const,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: "700" as const,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  welcomeText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  disclaimer: {
    fontSize: 11,
    textAlign: "center",
    marginBottom: 4,
    marginTop: 2,
  },
});
