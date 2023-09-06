'use client';

import { useRouter } from 'next/navigation';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  CallEndedAlertModalData,
  useModalStore,
} from '@/hooks/use-modal-store';

export default function CallEndedModal() {
  const { isOpen, onClose, type, data } = useModalStore();
  const router = useRouter();
  const { conversationId, serverId } = data as CallEndedAlertModalData;

  const handleClose = () => {
    onClose();
    router.push(`/servers/${serverId}/conversations/${conversationId}`);
  };

  const isModalOpen = isOpen && type === 'callEnded';

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className='dark:bg-zinc-900 border-2 border-indigo-500 overflow-hidden'>
        <DialogHeader className='pt-8 px-6'>
          <DialogTitle className='text-2xl text-center font-bold'>
            Call Ended
          </DialogTitle>
        </DialogHeader>

        <DialogFooter className='py-4'>
          <Button onClick={handleClose} variant='danger'>
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
