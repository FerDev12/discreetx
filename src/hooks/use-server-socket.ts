import { useSocket } from '@/components/providers/socket-provider';
import { Channel, Member, Server } from '@prisma/client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

type UseServerSocketProps = {
  serverId: string;
};

export function useServerSocket({ serverId }: UseServerSocketProps) {
  const { socket } = useSocket();
  const router = useRouter();
  const params = useParams();

  // KEYS
  const serverUpdateddKey = `server:${serverId}:updated`;
  const serverDeletedKey = `server:${serverId}:deleted`;
  const channelCreatedKey = `server:${serverId}:channel:created`;
  const channelUpdatedKey = `server:${serverId}:channel:updated`;
  const channelDeleltedKey = `server:${serverId}:channel:deleted`;
  const memberAddedKey = `server:${serverId}:member:added`;
  const memberUpdatedKey = `server:${serverId}:member:updated`;
  const memberDeletedKey = `server:${serverId}:member:deleted `;

  useEffect(() => {
    if (!socket) return;

    const onServerUpdate = (server?: Server) => {
      router.refresh();
    };
    const onServerDeleted = () => {
      router.push(`/servers/${serverId}`);
    };
    const onChannelCreated = (channel?: Channel) => {
      router.refresh();
    };
    const onChannelUpdated = (channel?: Channel) => {
      router.refresh();
    };
    const onChannelDeleted = (channelId: string) => {
      if ((params.channelId ?? '') === channelId) {
        router.push(`/servers/${serverId}`);
      } else {
        router.refresh();
      }
    };
    const onMemberAdded = (member?: Member) => {
      router.refresh();
    };
    const onMemberUpdated = (member?: Member) => {
      router.refresh();
    };
    const onMemberDeleted = (memberId?: string) => {
      if (params.memberId && params.memberId === memberId) {
        router.push(`/servers/${serverId}`);
      } else {
        router.refresh();
      }
    };

    socket.on(serverUpdateddKey, onServerUpdate);
    socket.on(serverDeletedKey, onServerDeleted);
    socket.on(channelCreatedKey, onChannelCreated);
    socket.on(channelDeleltedKey, onChannelDeleted);
    socket.on(channelUpdatedKey, onChannelUpdated);
    socket.on(memberAddedKey, onMemberAdded);
    socket.on(memberUpdatedKey, onMemberUpdated);
    socket.on(memberDeletedKey, onMemberDeleted);

    return () => {
      socket.off(serverUpdateddKey, onServerUpdate);
      socket.off(serverDeletedKey, onServerDeleted);
      socket.off(channelCreatedKey, onChannelCreated);
      socket.off(channelDeleltedKey, onChannelDeleted);
      socket.off(channelUpdatedKey, onChannelUpdated);
      socket.off(memberAddedKey, onMemberAdded);
      socket.off(memberUpdatedKey, onMemberUpdated);
      socket.off(memberDeletedKey, onMemberDeleted);
    };
  }, [
    router,
    params,
    socket,
    serverId,
    serverUpdateddKey,
    serverDeletedKey,
    channelCreatedKey,
    channelUpdatedKey,
    channelDeleltedKey,
    memberAddedKey,
    memberUpdatedKey,
    memberDeletedKey,
  ]);
}
