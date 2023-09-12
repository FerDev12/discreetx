import { useSocket } from '@/components/providers/socket-provider';
import { Call, Conversation, Member, Message, Profile } from '@prisma/client';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useConversationStore } from '../stores/use-conversation-store';
import { ModalType, useModalStore } from '../stores/use-modal-store';
import { useParams, useRouter } from 'next/navigation';
import { MemberWithProfile } from '@/types';

type ChatSocketProps = {
  addKey: string;
  updateKey: string;
  queryKey: string;
  // -------------
  typingKey?: string | null;
  callKey?: string | null;
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
  typingKey,
  callKey,
}: ChatSocketProps) {
  const router = useRouter();
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const { setIsTyping, setActiveCall, activeCall } = useConversationStore();
  const { onOpen, onClose } = useModalStore();
  const { callId } = useParams();
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

  useEffect(() => {
    if (!socket) return;
    if (!typingKey) return;

    const typingKeyListener = (isTyping: boolean) => setIsTyping(isTyping);
    socket.on(typingKey, typingKeyListener);

    return () => {
      socket.off(typingKey, typingKeyListener);
    };
  }, [typingKey, socket, setIsTyping]);

  useEffect(() => {
    if (!callKey || !socket) return;

    const socketListener = (
      call: Call & { conversation: Conversation; member: MemberWithProfile }
    ) => {
      if (call.active && !call.ended) {
        setActiveCall({ id: call.id, type: call.type });

        if (!call.answered) {
          if (activeCall || callId?.length > 0) return;
          return onOpen({
            type: ModalType.ANSWER_CALL,
            data: {
              callId: call.id,
              conversationId: call.conversationId,
              type: call.type,
              member: call.member,
            },
          });
        }

        if (call.answered) {
          onClose();
          return router.push(
            `/servers/${call.conversation.serverId}/conversations/${call.conversationId}/calls/${call.id}`
          );
        }
      }

      if (call.declined) {
        onClose();
      }

      if (call.cancelled) {
        onClose();
      }

      if (!call.active && call.ended && callId === call.id) {
        setActiveCall(null);
        onClose();
        router.push(
          `/servers/${call.conversation.serverId}/conversations/${call.conversationId}`
        );
      }
    };

    socket.on(callKey, socketListener);

    return () => {
      socket.off(callKey, socketListener);
    };
  }, [
    callKey,
    socket,
    onOpen,
    onClose,
    setActiveCall,
    router,
    callId,
    activeCall,
  ]);
}
