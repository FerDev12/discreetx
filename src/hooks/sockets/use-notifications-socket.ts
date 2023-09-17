import { useEffect } from 'react';

import { useSocket } from '@/components/providers/socket-provider';
import { useQueryClient } from '@tanstack/react-query';
import { useNotificationStore } from '../use-notification';
import { useParams } from 'next/navigation';

export function useNotificationsSocket({
  serverId,
  profileId,
}: {
  serverId: string;
  profileId: string;
}) {
  const queryClient = useQueryClient();
  const { socket, isConnected } = useSocket();
  const { add } = useNotificationStore();
  const params = useParams();

  useEffect(() => {
    if (!socket || !isConnected) return;

    const notificationsKey = `server:${serverId}:notifications:${profileId}`;
    const onNotification = (directMessage?: {
      from: string;
      imageUrl: string;
      message: string;
      memberId: string;
    }) => {
      queryClient.refetchQueries([`server:${serverId}:members`]);
      queryClient.refetchQueries([`server:${serverId}:channels`]);

      if (!!directMessage) {
        if (params?.memberId === directMessage?.memberId) {
          return;
        }
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
  }, [
    socket,
    isConnected,
    queryClient,
    params?.memberId,
    serverId,
    profileId,
    add,
  ]);
}
