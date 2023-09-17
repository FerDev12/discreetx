import { useSocket } from '@/components/providers/socket-provider';
import { Call, Channel, Conversation, Member } from '@prisma/client';
import { useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ModalType, useModalStore } from '../stores/use-modal-store';
import { useConversationStore } from '../stores/use-conversation-store';
import { useNotificationStore } from '../use-notification';

type UseServerSocketProps = {
  serverId: string;
  profileId: string;
};

type ServerEventData =
  | { type: 'server:leave'; data: undefined }
  | { type: 'server:deleted'; data: undefined }
  | { type: 'channel:created'; data?: Channel }
  | { type: 'channel:deleted'; data?: Channel }
  | { type: 'channel:updated'; data?: Channel }
  | { type: 'member:added'; data?: Member }
  | { type: 'member:updated'; data?: Member }
  | { type: 'member:deleted'; data?: Member };

export function useServerSocket({ serverId, profileId }: UseServerSocketProps) {
  const { socket } = useSocket();
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const { activeCall, setActiveCall } = useConversationStore();
  const { onOpen, onClose, isOpen, type } = useModalStore();
  const { add } = useNotificationStore();

  // KEYS
  const answerCallKey = `server:${serverId}:call:${profileId}:answer`;
  const callEditedKey = `server:${serverId}:call:${profileId}:edited`;
  const callEndedKey = `server:${serverId}:call:${profileId}:ended`;

  useEffect(() => {
    if (!socket) return;

    const onServerDeleted = () => {
      router.replace(`/`);
    };

    const onServerLeave = () => {
      queryClient.refetchQueries({
        queryKey: [`server:${serverId}:members`],
      });
    };

    const onChannelCreated = (channel?: Channel) => {
      if (channel?.profileId === profileId) return;
      add({ title: `Channel ${channel?.name} created!` });
      router.refresh();
    };

    const onChannelUpdated = (channel?: Channel) => {
      if (channel?.profileId === profileId) return;
      router.refresh();
    };

    const onChannelDeleted = (channel?: Channel) => {
      if (!channel) return router.refresh();

      if ((params.channelId ?? '') === channel.id) {
        router.replace(`/servers/${serverId}`);
      } else {
        router.refresh();
      }
    };

    const onMemberAdded = (member?: Member) => {
      if (!member || member.profileId === profileId) return;

      queryClient.refetchQueries([`server:${serverId}:members`]);
      add({
        title: `${member.username} just joined!`,
        description: '',
        variant: 'default',
      });
    };

    const onMemberUpdated = (member?: Member) => {
      if (!member) return;
      if (isOpen && type === ModalType.MANAGE_MEMBERS) return;
      if (member.profileId === profileId) {
        queryClient.refetchQueries([`server:${serverId}:members`]);
      }
    };

    const onMemberDeleted = (member?: Member) => {
      if (!member) return;

      if (member.profileId === profileId) router.replace('/');

      if (params.memberId && params.memberId === member.id) {
        router.replace(`/servers/${serverId}`);
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
        onClose();
        router.push(
          `/servers/${serverId}/conversations/${call.conversationId}/calls/${call.id}`
        );
        return;
      }
      if (call.declined || call.cancelled) {
        setActiveCall(null);
        if (
          isOpen &&
          type &&
          [ModalType.ANSWER_CALL, ModalType.CREATE_CALL].includes(type)
        ) {
          return onClose();
        }
        add({ title: 'Call cancelled' });
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

    const onServerEvent = ({ type, data }: ServerEventData) => {
      switch (type) {
        case 'server:leave':
          return onServerLeave();
        case 'server:deleted':
          return onServerDeleted();
        case 'channel:created':
          return onChannelCreated(data);
        case 'channel:updated':
          return onChannelUpdated(data);
        case 'channel:deleted':
          return onChannelDeleted(data);
        case 'member:added':
          return onMemberAdded(data);
        case 'member:updated':
          return onMemberUpdated(data);
        case 'member:deleted':
          return onMemberDeleted(data);
        default:
          break;
      }
    };

    socket.on(`server:${serverId}`, onServerEvent);
    socket.on(answerCallKey, onReceiveCall);
    socket.on(callEditedKey, onCallEdited);
    socket.on(callEndedKey, onCallEnded);

    return () => {
      socket.off(`server:${serverId}`, onServerEvent);
      socket.off(answerCallKey, onReceiveCall);
      socket.off(callEditedKey, onCallEdited);
      socket.off(callEndedKey, onCallEnded);
    };
  }, [
    router,
    params,
    socket,
    profileId,
    serverId,
    isOpen,
    type,
    queryClient,
    answerCallKey,
    callEditedKey,
    callEndedKey,
    activeCall,
    add,
    onOpen,
    onClose,
    setActiveCall,
  ]);
}
