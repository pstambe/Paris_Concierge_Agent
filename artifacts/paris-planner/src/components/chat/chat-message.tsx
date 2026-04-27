import React from "react";
import { type OpenaiMessage } from "@workspace/api-client-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: OpenaiMessage | { role: string; content: string };
  isStreaming?: boolean;
}

export function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === "user";

  const renderFormattedText = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      if (line.startsWith("### ")) {
        return <h3 key={i} className="text-base font-serif font-semibold text-primary mt-2 mb-0">{line.replace("### ", "")}</h3>;
      }
      if (line.startsWith("## ")) {
        return <h2 key={i} className="text-lg font-serif font-bold text-primary mt-2 mb-0">{line.replace("## ", "")}</h2>;
      }
      if (line.startsWith("# ")) {
        return <h1 key={i} className="text-xl font-serif font-bold text-primary mt-2 mb-0">{line.replace("# ", "")}</h1>;
      }
      if (line.match(/^[\-\*]\s/)) {
        return (
          <li key={i} className="ml-4 list-disc leading-snug">
            {renderInlineMarkdown(line.replace(/^[\-\*]\s/, ""))}
          </li>
        );
      }
      if (line.trim() === "") {
        return <div key={i} className="h-1" />;
      }
      return <p key={i} className="leading-snug">{renderInlineMarkdown(line)}</p>;
    });
  };

  const renderInlineMarkdown = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={i} className="italic text-foreground/90">{part.slice(1, -1)}</em>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className={cn("flex w-full gap-2 py-1", isUser ? "flex-row-reverse" : "flex-row")}>
      <div className={cn("flex-shrink-0", isUser && "hidden md:block")}>
        <Avatar className={cn("w-8 h-8 border-2 shadow-sm", isUser ? "border-secondary/20" : "border-primary/20")}>
          {isUser ? (
            <AvatarFallback className="bg-secondary/10 text-secondary-foreground font-serif text-sm">U</AvatarFallback>
          ) : (
            <AvatarFallback className="bg-primary text-primary-foreground font-serif text-sm">P</AvatarFallback>
          )}
        </Avatar>
      </div>

      <div className={cn(
        "flex max-w-[85%] md:max-w-[75%] flex-col",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "px-3 py-2 rounded-xl shadow-sm text-[14px]",
          isUser
            ? "bg-secondary text-secondary-foreground rounded-tr-none shadow-secondary/10"
            : "bg-card text-card-foreground border border-card-border rounded-tl-none shadow-card-border/50"
        )}>
          <div className={cn("prose prose-sm max-w-none", isUser && "text-secondary-foreground")}>
            {isUser ? (
              <p className="whitespace-pre-wrap m-0 leading-snug">{message.content}</p>
            ) : (
              renderFormattedText(message.content)
            )}
            {isStreaming && (
              <span className="inline-block w-1.5 h-4 ml-1 bg-primary animate-pulse align-middle" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
