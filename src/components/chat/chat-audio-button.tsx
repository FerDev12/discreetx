'use client';

import { Phone, PhoneOff } from 'lucide-react';
import { ActionTooltip } from '../action-tooltip';
import { useParams } from 'next/navigation';
import { useConversationStore } from '@/hooks/use-conversation-store';
import { useModalStore } from '@/hooks/use-modal-store';
import { CallType } from '@prisma/client';
import { MemberWithProfile } from '@/types';
import axios from 'axios';

export function ChatAudioButton({
  otherMember,
  conversationId,
  serverId,
  callType,
  callId,
  callActive,
}: {
  callType?: CallType;
  callId?: string;
  callActive?: string;
  serverId: string;
  conversationId: string;
  otherMember: MemberWithProfile;
}) {
  const { activeCall, setActiveCall } = useConversationStore();
  const { onOpen } = useModalStore();

  const Icon = activeCall ? PhoneOff : Phone;
  const tooltipLabel = activeCall ? 'End audio call' : 'Start audio call';

  const onClick = async () => {
    if (!activeCall) {
      onOpen('createCall', {
        conversationId,
        name: otherMember.profile.name,
        callType: CallType.VIDEO,
      });
    }

    try {
      const query = new URLSearchParams({
        conversationId,
        callId: activeCall?.id ?? '',
      });

      await axios.delete(`/api/socket/calls/${activeCall?.id}?${query}`);
      setActiveCall(null);
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
      <button
        onClick={onClick}
        disabled={!!activeCall && activeCall.type === CallType.VIDEO}
        className='hover:opacity-75 transition mr-4'
      >
        <Icon className='h-6 w-6 text-zinc-500 dark:text-zinc-400' />
      </button>
    </ActionTooltip>
  );
}
