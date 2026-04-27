import { useEffect, useRef, useState } from "react";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";
import { useChatStream } from "@/hooks/use-chat";
import {
  useListOpenaiConversations,
  useListOpenaiMessages,
  useCreateOpenaiConversation,
  getListOpenaiMessagesQueryKey,
  getListOpenaiConversationsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Sparkles, Compass } from "lucide-react";

export default function ChatPage() {
  const queryClient = useQueryClient();
  const { data: conversations = [], isLoading: isLoadingConvList } = useListOpenaiConversations();
  const createConversation = useCreateOpenaiConversation();

  const currentId = conversations.length > 0 ? conversations[0].id : undefined;

  useEffect(() => {
    if (!isLoadingConvList && conversations.length === 0 && !createConversation.isPending) {
      createConversation.mutate(
        { data: { title: "My Paris Trip" } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
          },
        }
      );
    }
  }, [isLoadingConvList, conversations.length]);

  const { data: messages = [], isLoading: isLoadingMessages } = useListOpenaiMessages(
    currentId as number,
    { query: { enabled: !!currentId } }
  );

  const { sendMessage, isStreaming, streamingMessage } = useChatStream(currentId);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, streamingMessage]);

  const handleSend = async (content: string) => {
    if (!currentId) return;

    const tempUserMessage = {
      id: Date.now(),
      conversationId: currentId,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };

    queryClient.setQueryData(getListOpenaiMessagesQueryKey(currentId), (old: any) => {
      return [...(old || []), tempUserMessage];
    });

    await sendMessage(content);

    queryClient.invalidateQueries({ queryKey: getListOpenaiMessagesQueryKey(currentId) });
  };

  const isInitializing =
    isLoadingConvList ||
    createConversation.isPending ||
    !currentId ||
    (isLoadingMessages && messages.length === 0);

  return (
    <div className="flex h-[100dvh] w-full bg-background overflow-hidden selection:bg-secondary/30">
      <main className="flex-1 flex flex-col h-full relative w-full">
        {/* Paris background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "url('/paris-bg.png')",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center center",
            opacity: 0.18,
          }}
        />

        {/* Header */}
        <div className="relative z-10 flex items-center gap-3 px-6 py-4 border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-primary-foreground shadow-sm">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold tracking-tight text-foreground leading-none">
              L'Itinéraire
            </h1>
            <p className="text-[10px] font-sans text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
              Paris Concierge
            </p>
          </div>
        </div>

        {isInitializing ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-1000">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 shadow-sm border border-primary/20">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
              Preparing your itinerary...
            </h2>
            <p className="text-muted-foreground font-sans font-medium text-sm">
              Gathering maps, opening the notebook.
            </p>
            <Loader2 className="w-5 h-5 text-primary animate-spin mt-8" />
          </div>
        ) : (
          <>
            <div
              className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 pt-6 pb-24 relative"
              ref={scrollRef}
            >
              <div className="max-w-3xl mx-auto space-y-2">
                {messages.length === 0 && !isStreaming ? (
                  <div className="py-12 text-center animate-in slide-in-from-bottom-4 duration-700 fade-in">
                    <div className="w-20 h-20 mx-auto rounded-full bg-card shadow-sm border border-border flex items-center justify-center mb-6">
                      <span className="font-serif text-4xl text-primary">B</span>
                    </div>
                    <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
                      Bonjour!
                    </h2>
                    <p className="text-lg text-muted-foreground font-serif max-w-lg mx-auto leading-relaxed">
                      I'm your personal Paris concierge. Tell me about your dream trip—when are you
                      traveling, what's your style, and what do you long to experience?
                    </p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => (
                      <ChatMessage key={msg.id} message={msg} />
                    ))}

                    {isStreaming && !streamingMessage && (
                      <div className="flex items-end gap-3 animate-in fade-in duration-500">
                        <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                          <span className="font-serif text-sm text-primary">B</span>
                        </div>
                        <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3 flex flex-col gap-2 max-w-xs">
                          <p className="text-sm text-primary font-serif italic animate-pulse">
                            Building your magical itinerary…
                          </p>
                          <div className="flex gap-1.5 items-center">
                            <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0ms]" />
                            <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:150ms]" />
                            <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:300ms]" />
                          </div>
                        </div>
                      </div>
                    )}

                    {isStreaming && streamingMessage && (
                      <ChatMessage
                        message={{ role: "assistant", content: streamingMessage }}
                        isStreaming
                      />
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/95 to-transparent pt-10 pb-6 px-4 sm:px-6 md:px-8">
              <div className="max-w-3xl mx-auto">
                <ChatInput onSend={handleSend} isLoading={isStreaming} />
                <p className="text-center text-xs text-muted-foreground/60 font-sans mt-3">
                  Your concierge is an AI. Recommendations should be verified before booking.
                </p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
