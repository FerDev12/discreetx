import { useEffect } from 'react';

import { useSocket } from '@/components/providers/socket-provider';
import { useQueryClient } from '@tanstack/react-query';

export function useNotificationsSocket({
  serverId,
  profileId,
}: {
  serverId: string;
  profileId: string;
}) {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const notificationsKey = `server:${serverId}:notifications:${profileId}`;
    const onNotification = () => {
      queryClient.refetchQueries([`server:${serverId}:members`]);
      queryClient.refetchQueries([`server:${serverId}:channels`]);
    };

    socket.on(notificationsKey, onNotification);

    return () => {
      socket.off(notificationsKey, onNotification);
    };
  }, [socket, queryClient, serverId, profileId]);
}
