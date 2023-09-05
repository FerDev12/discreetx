'use client';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { LeaveServerModalData, useModalStore } from '@/hooks/use-modal-store';

import { Button } from '../ui/button';
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function LeaveServerModal() {
  const { isOpen, onClose, onOpen, type, data } = useModalStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { server } = data as LeaveServerModalData;

  const isModalOpen = isOpen && type === 'leaveServer';

  const onLeaveServer = async () => {
    try {
      setIsLoading(true);
      await axios.patch(`/api/servers/${server?.id}/leave`);
      onClose();
      router.refresh();
      router.push('/');
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        console.error(err.response?.data);
      } else {
        console.error(err);
      }
    } finally {
      setIsLoading(true);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className='dark:bg-zinc-900 border-2 border-rose-500 overflow-hidden'>
        <DialogHeader className='pt-8 px-6'>
          <DialogTitle className='text-2xl text-center font-bold'>
            Leave Server
          </DialogTitle>

          <DialogDescription className='text-center text-muted-foreground'>
            Are you sure you want to leave{' '}
            <span className='font-semibold text-teal-500'>{server?.name}</span>?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className='py-4'>
          <Button onClick={onClose} disabled={isLoading} variant='ghost'>
            Cancel
          </Button>
          <Button onClick={onLeaveServer} disabled={isLoading} variant='danger'>
            {!isLoading ? 'Confirm' : 'Exiting...'}
            {isLoading && (
              <Loader2 className='w-4 h-4 ml-2 animate-spin text-rose-50' />
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
