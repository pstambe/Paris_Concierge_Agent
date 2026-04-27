import { useState, useCallback, useRef } from "react";
import { type OpenaiMessage } from "@workspace/api-client-react";

export function useChatStream(conversationId: number | undefined) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!conversationId) return;

    setIsStreaming(true);
    setStreamingMessage("");

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`/api/openai/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;

        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n").filter((line) => line.trim() !== "");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.replace("data: ", "");
              if (dataStr === "[DONE]") {
                done = true;
                break;
              }

              try {
                const data = JSON.parse(dataStr);
                if (data.content) {
                  setStreamingMessage((prev) => prev + data.content);
                }
                if (data.done) {
                  done = true;
                }
              } catch (e) {
                console.error("Error parsing SSE chunk", e);
              }
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Chat streaming error:", error);
      }
    } finally {
      setIsStreaming(false);
      setStreamingMessage("");
    }
  }, [conversationId]);

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    sendMessage,
    isStreaming,
    streamingMessage,
    stopStreaming,
  };
}
