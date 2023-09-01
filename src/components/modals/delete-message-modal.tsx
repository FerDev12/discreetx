'use client';

import { useState } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

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

type DeleteMessageModalProps = {
  deleteOptimisticMessage: (messageId: string) => void;
};

export default function DeleteMessageModal({
  deleteOptimisticMessage,
}: DeleteMessageModalProps) {
  const {
    isOpen,
    onClose,
    type,
    data: { apiUrl, query, messageId },
  } = useModalStore();
  // const [isLoading, setIsLoading] = useState(false);

  const isModalOpen = isOpen && type === 'deleteMessage';

  const onDeleteMessage = async () => {
    try {
      if (messageId?.length) {
        deleteOptimisticMessage(messageId);
      }

      onClose();

      // setIsLoading(true);
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
    //  finally {
    //   setIsLoading(false);
    // }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className='bg-gradient-to-br border-2 border-rose-500 overflow-hidden'>
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
          <Button
            onClick={onClose}
            //  disabled={isLoading}
            variant='ghost'
          >
            Cancel
          </Button>
          <Button
            onClick={onDeleteMessage}
            // disabled={isLoading}
            variant='danger'
          >
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
