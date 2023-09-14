'use client';

import { Video, VideoOff } from 'lucide-react';
import { ActionTooltip } from '../action-tooltip';
import { useConversationStore } from '@/hooks/stores/use-conversation-store';
import { ModalType, useModalStore } from '@/hooks/stores/use-modal-store';
import { CallType, Member } from '@prisma/client';
import { MemberWithProfile } from '@/types';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export function ChatVideoButton({
  otherMember,
  conversationId,
  serverId,
  callType,
  callId,
  callActive,
}: {
  callType?: CallType;
  callId?: string;
  callActive?: boolean;
  serverId: string;
  conversationId: string;
  otherMember: Member;
}) {
  const { activeCall, setActiveCall } = useConversationStore();
  const { onOpen } = useModalStore();
  const router = useRouter();
  const isOnCall = !!activeCall || callActive;

  const Icon = isOnCall ? VideoOff : Video;
  const tooltipLabel = isOnCall ? 'End video call' : 'Start video call';

  const onClick = async () => {
    if (!isOnCall) {
      return onOpen({
        type: ModalType.CREATE_CALL,
        data: {
          conversationId,
          serverId,
          name: otherMember.username,
          type: CallType.VIDEO,
        },
      });
    }

    try {
      const query = new URLSearchParams({
        conversationId,
        callId: callId ?? '',
      });

      await axios.delete(`/api/socket/calls/${callId}?${query}`);
      setActiveCall(null);
      router.push(`/servers/${serverId}/conversations/${conversationId}`);
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        console.error(err.response?.data);
      } else {
        console.error(err);
      }
    }
  };

  return (
    <ActionTooltip label={tooltipLabel} side='bottom'>
      <button onClick={onClick} className='hover:opacity-75 transition mr-4'>
        <Icon className='h-6 w-6 text-zinc-500 dark:text-zinc-400' />
      </button>
    </ActionTooltip>
  );
}
