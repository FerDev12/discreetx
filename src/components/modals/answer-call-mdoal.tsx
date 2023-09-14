'use client';

import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useConversationStore } from '@/hooks/stores/use-conversation-store';
import {
  AnswerCallModalData,
  useModalStore,
} from '@/hooks/stores/use-modal-store';

export default function AnswerCallModal() {
  const { isOpen, onClose, type, data } = useModalStore();
  const [isLoading, setIsLoading] = useState(false);
  const { setActiveCall } = useConversationStore();
  const router = useRouter();
  const { serverId } = useParams();
  const {
    conversationId,
    from,
    callId,
    type: callType,
  } = data as AnswerCallModalData;

  const isModalOpen = isOpen && type === 'answerCall';

  const onDeclineCall = async () => {
    try {
      setIsLoading(true);
      const query = new URLSearchParams({
        conversationId: conversationId ?? '',
      });

      await axios.patch(`/api/socket/calls/${callId}?${query}`, {
        declined: true,
        cancelled: false,
        answered: false,
      });

      setActiveCall(null);
      onClose();
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        console.error(err.response?.data);
      } else {
        console.error(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onAnswerCall = async () => {
    try {
      console.log(conversationId);
      setIsLoading(true);

      const query = new URLSearchParams({
        callId: callId ?? '',
        conversationId: conversationId ?? '',
      });

      const { data: call } = await axios.patch(
        `/api/socket/calls/${callId}?${query}`,
        {
          declined: false,
          answered: true,
          cancelled: false,
        }
      );

      onClose();
      setActiveCall({ id: call.id, type: call.type });
      router.push(
        `/servers/${serverId}/conversations/${conversationId}/calls/${call.id}`
      );
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        console.error(err.response?.data);
      } else {
        console.error(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onDeclineCall}>
      <DialogContent className='dark:bg-zinc-900 border-2 border-indigo-500 overflow-hidden'>
        <DialogHeader className='pt-8 px-6'>
          <DialogTitle className='text-2xl text-center font-bold'>
            Answer {callType?.toLowerCase()} call from {from?.name}?
          </DialogTitle>
        </DialogHeader>

        <DialogFooter className='py-4'>
          <Button
            onClick={onDeclineCall}
            disabled={isLoading}
            variant='destructive'
          >
            Decline
          </Button>
          <Button onClick={onAnswerCall} disabled={isLoading} variant='primary'>
            {!isLoading ? 'Answer' : 'Answer'}
            {isLoading && (
              <Loader2 className='w-4 h-4 ml-2 animate-spin text-teal-50' />
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
