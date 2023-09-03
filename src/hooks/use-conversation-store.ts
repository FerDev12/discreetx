import { create } from 'zustand';

type ConversationStore = {
  // PROPERTIES
  isTyping: boolean;
  // METHODS
  setIsTyping: (isTyping: boolean) => void;
};

export const useConversationStore = create<ConversationStore>((set) => ({
  isTyping: false,

  setIsTyping: (isTyping) => set({ isTyping }),
}));
