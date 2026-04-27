import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColors } from "@/hooks/useColors";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Props {
  message: Message;
  isStreaming?: boolean;
}

function renderFormattedText(text: string, colors: ReturnType<typeof useColors>): React.ReactNode[] {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("### ")) {
      return (
        <Text key={i} style={[styles.h3, { color: colors.primary }]}>
          {line.replace("### ", "")}
        </Text>
      );
    }
    if (line.startsWith("## ")) {
      return (
        <Text key={i} style={[styles.h2, { color: colors.primary }]}>
          {line.replace("## ", "")}
        </Text>
      );
    }
    if (line.startsWith("# ")) {
      return (
        <Text key={i} style={[styles.h1, { color: colors.primary }]}>
          {line.replace("# ", "")}
        </Text>
      );
    }
    if (line.match(/^[-*]\s/)) {
      return (
        <View key={i} style={styles.bulletRow}>
          <Text style={[styles.bullet, { color: colors.secondary }]}>{"\u2022"}</Text>
          <Text style={[styles.bulletText, { color: colors.assistantBubbleText }]}>
            {renderInline(line.replace(/^[-*]\s/, ""), colors)}
          </Text>
        </View>
      );
    }
    if (line.trim() === "") {
      return <View key={i} style={styles.spacer} />;
    }
    return (
      <Text key={i} style={[styles.body, { color: colors.assistantBubbleText }]}>
        {renderInline(line, colors)}
      </Text>
    );
  });
}

function renderInline(text: string, colors: ReturnType<typeof useColors>): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <Text key={i} style={[styles.bold, { color: colors.assistantBubbleText }]}>
          {part.slice(2, -2)}
        </Text>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <Text key={i} style={styles.italic}>
          {part.slice(1, -1)}
        </Text>
      );
    }
    return <Text key={i}>{part}</Text>;
  });
}

export function MessageBubble({ message, isStreaming }: Props) {
  const colors = useColors();
  const isUser = message.role === "user";

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      {!isUser && (
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={[styles.avatarText, { color: colors.primaryForeground }]}>P</Text>
        </View>
      )}
      <View
        style={[
          styles.bubble,
          isUser
            ? [styles.userBubble, { backgroundColor: colors.userBubble }]
            : [
                styles.assistantBubble,
                {
                  backgroundColor: colors.assistantBubble,
                  borderColor: colors.assistantBubbleBorder,
                },
              ],
          { maxWidth: "80%" },
        ]}
      >
        {isUser ? (
          <Text style={[styles.body, { color: colors.userBubbleText }]}>{message.content}</Text>
        ) : (
          <View>
            {renderFormattedText(message.content, colors)}
            {isStreaming && (
              <Text style={[styles.cursor, { color: colors.primary }]}>|</Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  rowUser: {
    justifyContent: "flex-end",
  },
  rowAssistant: {
    justifyContent: "flex-start",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    borderWidth: 1,
    borderBottomLeftRadius: 4,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  bold: {
    fontWeight: "700" as const,
  },
  italic: {
    fontStyle: "italic" as const,
  },
  h1: {
    fontSize: 20,
    fontWeight: "700" as const,
    marginTop: 10,
    marginBottom: 4,
  },
  h2: {
    fontSize: 17,
    fontWeight: "700" as const,
    marginTop: 8,
    marginBottom: 4,
  },
  h3: {
    fontSize: 15,
    fontWeight: "600" as const,
    marginTop: 6,
    marginBottom: 2,
  },
  bulletRow: {
    flexDirection: "row",
    marginBottom: 2,
    paddingLeft: 4,
  },
  bullet: {
    fontSize: 15,
    marginRight: 6,
    lineHeight: 22,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  spacer: {
    height: 6,
  },
  cursor: {
    fontSize: 16,
    fontWeight: "300" as const,
  },
});
