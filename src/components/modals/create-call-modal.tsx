'use client';

import axios from 'axios';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useModalStore } from '@/hooks/use-modal-store';
import { Button } from '../ui/button';

export default function CreateCallModal() {
  const {
    isOpen,
    onClose,
    type,
    data: { conversationId, member },
  } = useModalStore();

  const isModalOpen = isOpen && type === 'createCall';

  const onCreateCall = async () => {};

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className='dark:bg-zinc-900 border-2 border-rose-500 overflow-hidden'>
        <DialogHeader className='pt-8 px-6'>
          <DialogTitle className='text-2xl text-center font-bold'>
            Call {member?.profile.name}?
          </DialogTitle>
        </DialogHeader>

        <DialogFooter className='py-4'>
          <Button onClick={onClose} variant='ghost'>
            Cancel
          </Button>
          <Button onClick={onCreateCall} variant='danger'>
            Delete
            {/* {!isLoading ? 'Delete' : 'Deleting...'}
            {isLoading && (
              <Loader2 className='w-4 h-4 ml-2 animate-spin text-rose-50' />
            )} */}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
