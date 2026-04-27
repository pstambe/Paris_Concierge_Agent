import { useLocation } from "wouter";
import { format } from "date-fns";
import { MessageSquare, ArrowRight, Compass } from "lucide-react";
import { useListOpenaiConversations } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sidebar } from "@/components/layout/sidebar";

export default function ConversationsPage() {
  const [, setLocation] = useLocation();
  const { data: conversations = [], isLoading } = useListOpenaiConversations();

  return (
    <div className="flex h-[100dvh] w-full bg-background overflow-hidden selection:bg-secondary/30">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto w-full pt-14 md:pt-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12 py-10">
          <div className="flex items-center gap-3 mb-10">
            <Compass className="w-8 h-8 text-primary" />
            <div>
              <h1 className="font-serif text-3xl font-bold text-foreground">Your Travel Notebooks</h1>
              <p className="text-muted-foreground font-serif italic mt-1 text-lg">Past planning sessions and dream itineraries.</p>
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6 h-24" />
                </Card>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-2xl border border-border border-dashed">
              <MessageSquare className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="font-serif text-2xl font-semibold mb-2">The pages are empty</h3>
              <p className="text-muted-foreground mb-6 font-serif italic">Your Parisian journey hasn't begun yet.</p>
              <Button onClick={() => setLocation("/")} className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-serif text-lg h-12 px-8">
                Start Planning
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {conversations.map(conv => (
                <Card 
                  key={conv.id} 
                  className="group cursor-pointer hover:shadow-md transition-all hover:border-primary/30"
                  onClick={() => setLocation(`/?id=${conv.id}`)}
                >
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                        {conv.title}
                      </h3>
                      <p className="text-sm text-muted-foreground font-sans mt-1">
                        Started {format(new Date(conv.createdAt), "MMMM d, yyyy")}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-secondary-foreground transition-all">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
