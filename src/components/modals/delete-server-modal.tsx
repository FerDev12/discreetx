'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
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
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export default function DeleteServerModal() {
  const {
    isOpen,
    onClose,
    onOpen,
    type,
    data: { server },
  } = useModalStore();
  const router = useRouter();
  const [value, setValue] = useState('');
  const [namesMatch, setNamesMatch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isDisabled = isLoading || !namesMatch;

  const isModalOpen = isOpen && type === 'deleteServer';

  const onDeleteServer = async () => {
    try {
      setIsLoading(true);
      await axios.delete(`/api/servers/${server?.id}`);
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
      <DialogContent className='bg-gradient-to-br border-2 border-rose-500 overflow-hidden'>
        <DialogHeader className='pt-8 px-6'>
          <DialogTitle className='text-2xl text-center font-bold'>
            Delete Server
          </DialogTitle>

          <DialogDescription className='text-center text-muted-foreground'>
            Are you sure you want to do this?{' '}
            <span className='font-semibold text-teal-500'>{server?.name}</span>{' '}
            will be permanently deleted.
          </DialogDescription>
        </DialogHeader>

        <div className='flex flex-col space-y-4 mt-4'>
          <Label className='text-muted-foreground'>
            Please type <span className='text-teal-500'>{server?.name}</span> to
            delete the server.
          </Label>
          <Input
            type='text'
            disabled={isLoading}
            placeholder={server?.name}
            value={value}
            onChange={(e) => {
              const val = e.target.value;

              if (val === server?.name) {
                setNamesMatch(true);
              } else {
                setNamesMatch(false);
              }

              setValue(val);
            }}
          />
        </div>

        <DialogFooter className='py-4'>
          <Button onClick={onClose} disabled={isDisabled} variant='ghost'>
            Cancel
          </Button>
          <Button
            onClick={onDeleteServer}
            disabled={isDisabled}
            variant='danger'
          >
            {!isLoading ? 'Confirm' : 'Deleting...'}
            {isLoading && (
              <Loader2 className='w-4 h-4 ml-2 animate-spin text-rose-50' />
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
