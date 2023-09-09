import { useSocket } from '@/components/providers/socket-provider';
import { Channel, Member, Server } from '@prisma/client';
import { useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

type UseServerSocketProps = {
  serverId: string;
  profileId: string;
};

export function useServerSocket({ serverId, profileId }: UseServerSocketProps) {
  const { socket } = useSocket();
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();

  // KEYS
  const serverDeletedKey = `server:${serverId}:deleted`;
  const serverLeaveKey = `server:${serverId}:member:leave`;
  const channelCreatedKey = `server:${serverId}:channel:created`;
  const channelUpdatedKey = `server:${serverId}:channel:updated`;
  const channelDeleltedKey = `server:${serverId}:channel:deleted`;
  const memberAddedKey = `server:${serverId}:member:added`;
  const memberUpdatedKey = `server:${serverId}:member:updated`;
  const memberDeletedKey = `server:${serverId}:member:deleted `;
  const notificationsKey = `server:${serverId}:notifications:${profileId}`;

  useEffect(() => {
    if (!socket) return;

    const onServerDeleted = () => {
      router.push(`/servers/${serverId}`);
    };

    const onServerLeave = () => {
      queryClient.refetchQueries({
        queryKey: [`server:${serverId}:members`],
      });
    };

    const onChannelCreated = (channel?: Channel) => {
      queryClient.refetchQueries({
        queryKey: [`server:${serverId}:channels`],
      });
    };
    const onChannelUpdated = () => {
      queryClient.refetchQueries({
        queryKey: [`server:${serverId}:channels`],
      });
    };

    const onChannelDeleted = (channelId: string) => {
      if ((params.channelId ?? '') === channelId) {
        router.push(`/servers/${serverId}`);
      } else {
        queryClient.refetchQueries([`server:${serverId}:channels`]);
      }
    };

    const onMemberAdded = (member?: Member) => {
      if (!member) {
        return router.refresh();
      }

      queryClient.refetchQueries([`server:${serverId}:channels`]);
    };

    const onMemberUpdated = (member?: Member) => {
      if (!member) {
        return router.refresh();
      }
      queryClient.refetchQueries([`server:${serverId}:channels`]);
    };

    const onMemberDeleted = (memberId?: string) => {
      if (params.memberId && params.memberId === memberId) {
        router.push(`/servers/${serverId}`);
      } else {
        queryClient.refetchQueries([`server:${serverId}:members`]);
      }
    };

    const onNotification = () => {
      queryClient.refetchQueries({
        queryKey: [`server:${serverId}:channels`],
      });
      queryClient.refetchQueries({
        queryKey: [`server:${serverId}:members`],
      });
    };

    socket.on(serverDeletedKey, onServerDeleted);
    socket.on(serverLeaveKey, onServerLeave);
    socket.on(channelCreatedKey, onChannelCreated);
    socket.on(channelDeleltedKey, onChannelDeleted);
    socket.on(channelUpdatedKey, onChannelUpdated);
    socket.on(memberAddedKey, onMemberAdded);
    socket.on(memberUpdatedKey, onMemberUpdated);
    socket.on(memberDeletedKey, onMemberDeleted);
    socket.on(notificationsKey, onNotification);

    return () => {
      socket.off(serverDeletedKey, onServerDeleted);
      socket.off(serverLeaveKey, onServerLeave);
      socket.off(channelCreatedKey, onChannelCreated);
      socket.off(channelDeleltedKey, onChannelDeleted);
      socket.off(channelUpdatedKey, onChannelUpdated);
      socket.off(memberAddedKey, onMemberAdded);
      socket.off(memberUpdatedKey, onMemberUpdated);
      socket.off(memberDeletedKey, onMemberDeleted);
      socket.off(notificationsKey, onNotification);
    };
  }, [
    router,
    params,
    socket,
    serverId,
    queryClient,
    serverDeletedKey,
    serverLeaveKey,
    channelCreatedKey,
    channelUpdatedKey,
    channelDeleltedKey,
    memberAddedKey,
    memberUpdatedKey,
    memberDeletedKey,
    notificationsKey,
  ]);
}
