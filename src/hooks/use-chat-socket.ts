import { useSocket } from '@/components/providers/socket-provider';
import { Member, Message, Profile } from '@prisma/client';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

type ChatSocketProps = {
  addKey: string;
  updateKey: string;
  queryKey: string;
};

type MessageWithMemberWithProfile = Message & {
  member: Member & {
    profile: Profile;
  };
};

export function useChatSocket({
  addKey,
  updateKey,
  queryKey,
}: ChatSocketProps) {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) {
      return;
    }

    const updateKeyListener = (message?: MessageWithMemberWithProfile) => {
      if (!message) return;

      queryClient.setQueryData([queryKey], (oldData: any) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return oldData;
        }

        const newData = oldData.pages.map((page: any) => {
          return {
            ...page,
            items: page.items.map((item: MessageWithMemberWithProfile) => {
              if (item.id === message.id) {
                return message;
              }
              return item;
            }),
          };
        });

        return {
          ...oldData,
          pages: newData,
        };
      });
    };

    const addKeyListener = (message?: MessageWithMemberWithProfile) => {
      if (!message) return;

      queryClient.setQueryData([queryKey], (oldData: any) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return {
            pages: [{ items: [message] }],
          };
        }

        const newData = [...oldData.pages];

        newData[0] = {
          ...newData[0],
          items: [message, ...newData[0].items],
        };

        return {
          ...oldData,
          pages: newData,
        };
      });
    };

    socket.on(updateKey, updateKeyListener);
    socket.on(addKey, addKeyListener);

    return () => {
      socket.off(addKey, addKeyListener);
      socket.off(updateKey, updateKeyListener);
    };
  }, [socket, queryClient, addKey, updateKey, queryKey]);
}
