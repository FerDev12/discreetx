import { create } from 'zustand';

type ConversationStore = {
  isTyping: boolean;
  setIsTyping: (isTyping: boolean) => void;
};

export const useConversationStore = create<ConversationStore>((set) => ({
  isTyping: false,
  setIsTyping: (isTyping) => set({ isTyping }),
}));
