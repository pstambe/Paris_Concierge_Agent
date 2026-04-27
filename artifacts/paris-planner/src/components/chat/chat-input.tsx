import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizontal, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, isLoading, placeholder = "Tell me about your dream trip to Paris..." }: ChatInputProps) {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [content]);

  const handleSend = () => {
    const trimmed = content.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setContent("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative flex items-end w-full max-w-4xl mx-auto bg-card rounded-xl border border-border shadow-md overflow-hidden transition-shadow focus-within:shadow-lg focus-within:border-primary/30">
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="min-h-[60px] w-full resize-none bg-transparent border-0 focus-visible:ring-0 py-4 px-5 text-base placeholder:text-muted-foreground font-sans text-foreground"
        disabled={isLoading}
        rows={1}
      />
      <div className="px-3 pb-3 pt-2">
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!content.trim() || isLoading}
          className={cn(
            "h-10 w-10 rounded-full transition-all",
            content.trim() && !isLoading ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg hover:-translate-y-0.5" : "bg-muted text-muted-foreground"
          )}
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <SendHorizontal className="w-5 h-5" />}
        </Button>
      </div>
    </div>
  );
}
