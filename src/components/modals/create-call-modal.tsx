'use client';

import axios from 'axios';

import { useState } from 'react';
import { PhoneCall, Video } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  CreateCallModalData,
  useModalStore,
} from '@/hooks/stores/use-modal-store';
import { useConversationStore } from '@/hooks/stores/use-conversation-store';
import { CallType } from '@prisma/client';

export default function CreateCallModal() {
  const { isOpen, onClose, type, data } = useModalStore();
  const { setIsCalling, isCalling, setActiveCall } = useConversationStore();
  const [callId, setCallId] = useState('');
  const {
    conversationId,
    serverId,
    type: callType,
    name,
  } = data as CreateCallModalData;

  const isModalOpen = isOpen && type === 'createCall';

  const handleClose = async () => {
    try {
      if (!isCalling) return onClose();
      if (!callId) return onClose();
      if (!conversationId) return onClose();
      if (!serverId) return onClose();

      const query = new URLSearchParams({
        conversationId: conversationId ?? '',
        serverId: serverId ?? '',
      });

      await axios.patch(`/api/socket/calls/${callId}?${query}`, {
        declined: false,
        answered: false,
        cancelled: true,
      });

      setActiveCall(null);
      setCallId('');

      onClose();
      setIsCalling(false);
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        console.error(err.response?.data);
      } else {
        console.error(err);
      }
    }
  };

  const onCreateCall = async () => {
    if (!serverId || !conversationId) return onClose();
    try {
      setIsCalling(true);
      const query = new URLSearchParams({
        conversationId: conversationId ?? '',
        serverId: serverId ?? '',
      });

      const { data: call } = await axios.post(`/api/socket/calls?${query}`, {
        type: callType,
      });

      setActiveCall({ id: call.id, type: call.type });
      setCallId(call.id);
    } catch (err: any) {
      setIsCalling(false);
      if (axios.isAxiosError(err)) {
        console.error(err.response?.data);
      } else {
        console.error(err);
      }
    }
  };

  const icon = callType === CallType.AUDIO ? <PhoneCall /> : <Video />;

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className='dark:bg-zinc-900 border-2 border-indigo-500 overflow-hidden'>
        <DialogHeader className='pt-8 px-6'>
          <DialogTitle className='text-2xl text-center font-bold'>
            Call {name}?
          </DialogTitle>

          <DialogDescription className='text-sm text-center text-muted-foreground'>
            {!isCalling &&
              `Start a ${callType?.toLowerCase()} call with ${name}`}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className='py-4'>
          <Button onClick={handleClose} variant='ghost'>
            Cancel
          </Button>
          <Button onClick={onCreateCall} variant='primary'>
            {isCalling ? 'Calling...' : 'Call'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
