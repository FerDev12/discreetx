import { randomBytes } from 'crypto';
import { create } from 'zustand';

type Notification = {
  id: string;
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
  href?: string;
  avatarUrl?: string;
};

type NotificationStore = {
  notifications: Notification[];
  add: (notification: {
    title: string;
    description?: string;
    variant?: 'default' | 'destructive';
    href?: string;
    avatarUrl?: string;
  }) => void;
  pop: () => void;
  close: (id: string) => void;
};

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  add: (noti) =>
    set((state) => {
      state.notifications.push({
        ...noti,
        id: randomBytes(8).toString('hex'),
        description: noti.description ?? '',
      });
      return { ...state, notifications: [...state.notifications] };
    }),
  pop: () =>
    set((state) => {
      state.notifications.pop();
      return { ...state, notifications: [...state.notifications] };
    }),
  close: (id: string) =>
    set((state) => {
      const i = state.notifications.findIndex((noti) => noti.id === id);
      if (i === -1) return state;
      state.notifications = [
        ...state.notifications.slice(0, i),
        ...state.notifications.slice(i + 1),
      ];
      return state;
    }),
}));
