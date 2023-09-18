import { Call } from '@prisma/client';
import { randomBytes } from 'crypto';
import { create } from 'zustand';

type Notification = { id?: string } & (
  | {
      type: 'call';
      data: {
        from: {
          avatarUrl: string;
          username: string;
          memberId: string;
        };
        call: Call;
        serverId: string;
      };
    }
  | {
      type: 'default';
      data: {
        title: string;
        description: string;
        href?: string;
      };
    }
  | {
      type: 'destructive';
      data: {
        title: string;
        description: string;
        href?: string;
      };
    }
);

type NotificationStore = {
  notifications: Notification[];
  add: (notification: Notification) => void;
  pop: () => void;
  close: (id: string) => void;
};

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  add: (noti) =>
    set((state) => {
      if (noti.type === 'call') {
        state.notifications = [noti];
      } else {
        state.notifications.push({
          id: randomBytes(8).toString('hex'),
          ...noti,
        });
      }

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
