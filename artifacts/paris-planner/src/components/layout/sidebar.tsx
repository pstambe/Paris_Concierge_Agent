import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import { Map, Plus, MessageSquare, Menu, X, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useListOpenaiConversations, useCreateOpenaiConversation } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface SidebarProps {
  currentId?: number;
}

export function Sidebar({ currentId }: SidebarProps) {
  const [, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const { data: conversations = [], isLoading } = useListOpenaiConversations();
  const createConversation = useCreateOpenaiConversation();

  const handleNewChat = () => {
    createConversation.mutate(
      { data: { title: "New Planning Session" } },
      {
        onSuccess: (newConv) => {
          setLocation(`/?id=${newConv.id}`);
          setMobileOpen(false);
        }
      }
    );
  };

  const navContent = (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border shadow-sm">
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-sm">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold tracking-tight text-sidebar-foreground">L'Itinéraire</h1>
            <p className="text-xs font-sans text-muted-foreground font-medium uppercase tracking-wider">Paris Concierge</p>
          </div>
        </div>

        <Button 
          onClick={handleNewChat}
          className="w-full justify-start gap-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-serif font-medium text-lg shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Plan New Trip
        </Button>
      </div>

      <div className="px-4 pb-2">
        <h2 className="px-2 text-xs font-sans font-bold uppercase tracking-wider text-muted-foreground/70 mb-2">Past Planning</h2>
      </div>

      <ScrollArea className="flex-1 px-4">
        {isLoading ? (
          <div className="space-y-3 px-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-muted/50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center px-4 py-8 text-muted-foreground font-serif italic text-sm">
            No past trips planned. Let's start dreaming!
          </div>
        ) : (
          <div className="space-y-1 pb-6">
            {conversations.map((conv) => {
              const isActive = currentId === conv.id;
              return (
                <Link key={conv.id} href={`/?id=${conv.id}`}>
                  <div
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors group",
                      isActive 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "hover:bg-muted text-sidebar-foreground/80 hover:text-sidebar-foreground"
                    )}
                  >
                    <MessageSquare className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-primary" : "text-muted-foreground group-hover:text-sidebar-foreground/70")} />
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm truncate font-serif", isActive ? "font-semibold text-primary" : "")}>
                        {conv.title}
                      </p>
                      <p className="text-[10px] font-sans text-muted-foreground/80 mt-0.5 truncate">
                        {format(new Date(conv.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </ScrollArea>
      
      <div className="p-4 border-t border-sidebar-border text-center bg-sidebar-accent/30">
        <p className="font-serif italic text-xs text-muted-foreground/80">
          "Paris is always a good idea."
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-background border-b border-border z-40 flex items-center px-4 justify-between">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-primary" />
          <span className="font-serif font-bold text-lg">L'Itinéraire</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar Container */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {navContent}
      </div>
    </>
  );
}
