import { CallType } from '@prisma/client';
import { create } from 'zustand';

interface ActiveCall {
  id: string;
  type: CallType;
}

type ConversationStore = {
  // PROPERTIES
  isTyping: boolean;
  activeCall?: ActiveCall | null;
  isCalling: boolean;
  // METHODS
  setIsTyping: (isTyping: boolean) => void;
  setActiveCall: (activeCall: ActiveCall | null) => void;
  setIsCalling: (isCalling: boolean) => void;
};

export const useConversationStore = create<ConversationStore>((set) => ({
  isTyping: false,
  isCalling: false,
  setIsTyping: (isTyping) => set({ isTyping }),
  setActiveCall: (activeCall) => set({ activeCall }),
  setIsCalling: (isCalling) => set({ isCalling }),
}));
