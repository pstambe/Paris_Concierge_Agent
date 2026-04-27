import React, { forwardRef, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export const ChatInput = forwardRef<TextInput, Props>(function ChatInput(
  { onSend, disabled },
  ref
) {
  const colors = useColors();
  const [text, setText] = useState("");

  const canSend = text.trim().length > 0 && !disabled;

  const handleSend = () => {
    if (!canSend) return;
    const trimmed = text.trim();
    setText("");
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onSend(trimmed);
    if (ref && "current" in ref) {
      ref.current?.focus();
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <TextInput
        ref={ref}
        value={text}
        onChangeText={setText}
        placeholder="Tell me about your dream trip..."
        placeholderTextColor={colors.mutedForeground}
        style={[styles.input, { color: colors.foreground }]}
        multiline
        blurOnSubmit={false}
        onSubmitEditing={handleSend}
        editable={!disabled}
        returnKeyType="send"
      />
      <TouchableOpacity
        onPress={handleSend}
        disabled={!canSend}
        style={[
          styles.sendButton,
          {
            backgroundColor: canSend ? colors.primary : colors.muted,
          },
        ]}
        activeOpacity={0.7}
      >
        {disabled ? (
          <ActivityIndicator size="small" color={colors.primaryForeground} />
        ) : (
          <Feather
            name="send"
            size={18}
            color={canSend ? colors.primaryForeground : colors.mutedForeground}
          />
        )}
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    shadowColor: "#2C251B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    maxHeight: 120,
    paddingTop: 4,
    paddingBottom: 4,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    flexShrink: 0,
  },
});
