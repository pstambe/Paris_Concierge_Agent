import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Sidebar } from "@/components/layout/sidebar";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";
import { useChatStream } from "@/hooks/use-chat";
import { useGetOpenaiConversation, useListOpenaiMessages, useCreateOpenaiConversation } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Sparkles } from "lucide-react";
import { getListOpenaiMessagesQueryKey, getListOpenaiConversationsQueryKey } from "@workspace/api-client-react";

export default function ChatPage() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const idParam = searchParams.get("id");
  const currentId = idParam ? parseInt(idParam, 10) : undefined;

  const queryClient = useQueryClient();
  const createConversation = useCreateOpenaiConversation();

  // If no ID is provided, automatically create a new conversation and redirect
  useEffect(() => {
    if (!currentId && !createConversation.isPending) {
      createConversation.mutate(
        { data: { title: "New Planning Session" } },
        {
          onSuccess: (newConv) => {
            queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
            setLocation(`/?id=${newConv.id}`, { replace: true });
          }
        }
      );
    }
  }, [currentId]);

  const { data: conversation, isLoading: isLoadingConv } = useGetOpenaiConversation(currentId as number, { 
    query: { enabled: !!currentId } 
  });
  
  const { data: messages = [], isLoading: isLoadingMessages } = useListOpenaiMessages(currentId as number, {
    query: { enabled: !!currentId }
  });

  const { sendMessage, isStreaming, streamingMessage } = useChatStream(currentId);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, streamingMessage]);

  const handleSend = async (content: string) => {
    if (!currentId) return;
    
    // Optimistically update cache to show user message immediately
    const tempUserMessage = {
      id: Date.now(),
      conversationId: currentId,
      role: "user",
      content,
      createdAt: new Date().toISOString()
    };

    queryClient.setQueryData(getListOpenaiMessagesQueryKey(currentId), (old: any) => {
      return [...(old || []), tempUserMessage];
    });

    await sendMessage(content);
    
    // Invalidate to fetch the final AI message
    queryClient.invalidateQueries({ queryKey: getListOpenaiMessagesQueryKey(currentId) });
  };

  const isInitializing = !currentId || isLoadingConv || (isLoadingMessages && messages.length === 0);

  return (
    <div className="flex h-[100dvh] w-full bg-background overflow-hidden selection:bg-secondary/30">
      <Sidebar currentId={currentId} />
      
      <main className="flex-1 flex flex-col h-full relative w-full pt-14 md:pt-0">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply bg-[url('https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center" />
        
        {isInitializing ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-1000">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 shadow-sm border border-primary/20">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Preparing your itinerary...</h2>
            <p className="text-muted-foreground font-sans font-medium text-sm">Gathering maps, opening the notebook.</p>
            <Loader2 className="w-5 h-5 text-primary animate-spin mt-8" />
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 pt-6 pb-24 relative" ref={scrollRef}>
              <div className="max-w-3xl mx-auto space-y-2">
                {messages.length === 0 && !isStreaming ? (
                  <div className="py-12 text-center animate-in slide-in-from-bottom-4 duration-700 fade-in">
                    <div className="w-20 h-20 mx-auto rounded-full bg-card shadow-sm border border-border flex items-center justify-center mb-6">
                      <span className="font-serif text-4xl text-primary">B</span>
                    </div>
                    <h2 className="font-serif text-3xl font-bold text-foreground mb-4">Bonjour!</h2>
                    <p className="text-lg text-muted-foreground font-serif max-w-lg mx-auto leading-relaxed">
                      I'm your personal Paris concierge. Tell me about your dream trip—when are you traveling, what's your style, and what do you long to experience?
                    </p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => (
                      <ChatMessage key={msg.id} message={msg} />
                    ))}
                    
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
                <ChatInput 
                  onSend={handleSend} 
                  isLoading={isStreaming} 
                />
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
