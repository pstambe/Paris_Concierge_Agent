import React, { createContext, useContext, useState } from "react";

interface ConversationContextType {
  currentConversationId: number | undefined;
  setCurrentConversationId: (id: number | undefined) => void;
}

const ConversationContext = createContext<ConversationContextType>({
  currentConversationId: undefined,
  setCurrentConversationId: () => {},
});

export function ConversationProvider({ children }: { children: React.ReactNode }) {
  const [currentConversationId, setCurrentConversationId] = useState<number | undefined>(undefined);

  return (
    <ConversationContext.Provider value={{ currentConversationId, setCurrentConversationId }}>
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversation() {
  return useContext(ConversationContext);
}
