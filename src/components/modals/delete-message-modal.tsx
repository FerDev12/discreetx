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
import { Button } from '@/components/ui/button';
import {
  DeleteMessageModalData,
  useModalStore,
} from '@/hooks/stores/use-modal-store';

export default function DeleteMessageModal() {
  const { isOpen, onClose, type, data } = useModalStore();
  const { apiUrl, query, messageId, deleteOptimisticMessage } =
    data as DeleteMessageModalData;
  const isModalOpen = isOpen && type === 'deleteMessage';

  const onDeleteMessage = async () => {
    try {
      if (deleteOptimisticMessage && messageId?.length) {
        deleteOptimisticMessage(messageId);
      }

      onClose();

      const params = new URLSearchParams({
        ...query,
      });

      await axios.delete(`${apiUrl}?${params}`);
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        console.error(err.response?.data);
      } else {
        console.error(err);
      }
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className='dark:bg-zinc-900 border-2 border-rose-500 overflow-hidden'>
        <DialogHeader className='pt-8 px-6'>
          <DialogTitle className='text-2xl text-center font-bold'>
            Delete Message
          </DialogTitle>

          <DialogDescription className='text-center text-muted-foreground'>
            Are you sure you want to do this? <br />
            The message will be permanently deleted
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className='py-4'>
          <Button onClick={onClose} variant='ghost'>
            Cancel
          </Button>
          <Button onClick={onDeleteMessage} variant='danger'>
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
