import { useSocket } from '@/components/providers/socket-provider';
import { Call, Channel, Conversation, Member } from '@prisma/client';
import { useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ModalType, useModalStore } from '../stores/use-modal-store';
import { useConversationStore } from '../stores/use-conversation-store';

type UseServerSocketProps = {
  serverId: string;
  profileId: string;
};

export function useServerSocket({ serverId, profileId }: UseServerSocketProps) {
  const { socket } = useSocket();
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const { activeCall, setActiveCall } = useConversationStore();
  const { onOpen, onClose } = useModalStore();

  // KEYS
  const serverDeletedKey = `server:${serverId}:deleted`;
  const serverLeaveKey = `server:${serverId}:member:leave`;
  const channelCreatedKey = `server:${serverId}:channel:created`;
  const channelUpdatedKey = `server:${serverId}:channel:updated`;
  const channelDeleltedKey = `server:${serverId}:channel:deleted`;
  const memberAddedKey = `server:${serverId}:member:added`;
  const memberUpdatedKey = `server:${serverId}:member:updated`;
  const memberDeletedKey = `server:${serverId}:member:deleted `;
  const answerCallKey = `server:${serverId}:call:${profileId}:answer`;
  const callEditedKey = `server:${serverId}:call:${profileId}:edited`;
  const callEndedKey = `server:${serverId}:call:${profileId}:ended`;

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

    const onReceiveCall = async ({
      call,
      from,
    }: {
      call: Call & { conversation: Conversation };
      from: {
        id: string;
        name: string;
        imageUrl: string;
      };
    }) => {
      if (params.callId?.length > 0 || !!activeCall) {
        // FIXME DECLINE CALL
        const query = new URLSearchParams({
          conversationId: call.conversationId,
        });
        fetch(`/api/socket/calls/${call.id}?${query}`, {
          method: 'PATCH',
          body: JSON.stringify({
            declined: true,
            answered: false,
            cancelled: false,
          }),
        }).catch((err) => console.error(err));
        return;
      }

      onOpen({
        type: ModalType.ANSWER_CALL,
        data: {
          callId: call.id,
          conversationId: call.conversationId,
          from,
          type: 'VIDEO',
        },
      });
    };

    const onCallEdited = (call: Call & { conversation: Conversation }) => {
      if (call.answered) {
        router.push(
          `/servers/${serverId}/conversations/${call.conversationId}/calls/${call.id}`
        );
      }
      if (call.declined || call.cancelled) {
        onClose();
      }
    };
    const onCallEnded = (call: Call & { conversation: Conversation }) => {
      if (params?.callId === call.id) {
        setActiveCall(null);
        router.push(
          `/servers/${serverId}/conversations/${call.conversationId}`
        );
      }
    };

    socket.on(serverDeletedKey, onServerDeleted);
    socket.on(serverLeaveKey, onServerLeave);
    socket.on(channelCreatedKey, onChannelCreated);
    socket.on(channelDeleltedKey, onChannelDeleted);
    socket.on(channelUpdatedKey, onChannelUpdated);
    socket.on(memberAddedKey, onMemberAdded);
    socket.on(memberUpdatedKey, onMemberUpdated);
    socket.on(memberDeletedKey, onMemberDeleted);
    socket.on(answerCallKey, onReceiveCall);
    socket.on(callEditedKey, onCallEdited);
    socket.on(callEndedKey, onCallEnded);

    return () => {
      socket.off(serverDeletedKey, onServerDeleted);
      socket.off(serverLeaveKey, onServerLeave);
      socket.off(channelCreatedKey, onChannelCreated);
      socket.off(channelDeleltedKey, onChannelDeleted);
      socket.off(channelUpdatedKey, onChannelUpdated);
      socket.off(memberAddedKey, onMemberAdded);
      socket.off(memberUpdatedKey, onMemberUpdated);
      socket.off(memberDeletedKey, onMemberDeleted);
      socket.off(answerCallKey, onReceiveCall);
      socket.off(callEditedKey, onCallEdited);
      socket.off(callEndedKey, onCallEnded);
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
    answerCallKey,
    callEditedKey,
    callEndedKey,
    activeCall,
    onOpen,
    onClose,
    setActiveCall,
  ]);
}
