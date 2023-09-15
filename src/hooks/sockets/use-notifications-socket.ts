import { useEffect } from 'react';

import { useSocket } from '@/components/providers/socket-provider';
import { useQueryClient } from '@tanstack/react-query';
import { useNotificationStore } from '../use-notification';

export function useNotificationsSocket({
  serverId,
  profileId,
}: {
  serverId: string;
  profileId: string;
}) {
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const { add } = useNotificationStore();

  useEffect(() => {
    if (!socket) return;

    const notificationsKey = `server:${serverId}:notifications:${profileId}`;
    const onNotification = (directMessage?: {
      from: string;
      imageUrl: string;
      message: string;
    }) => {
      queryClient.refetchQueries([`server:${serverId}:members`]);
      queryClient.refetchQueries([`server:${serverId}:channels`]);

      if (!!directMessage) {
        add({
          title: `${directMessage.from} sent you a message`,
          description: directMessage.message,
        });
      }
    };

    socket.on(notificationsKey, onNotification);

    return () => {
      socket.off(notificationsKey, onNotification);
    };
  }, [socket, queryClient, serverId, profileId, add]);
}
