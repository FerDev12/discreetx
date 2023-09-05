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
import { DeleteChannelModalData, useModalStore } from '@/hooks/use-modal-store';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useForm } from 'react-hook-form';

export default function DeleteChannelModal() {
  const { isOpen, onClose, type, data } = useModalStore();
  const router = useRouter();
  const [value, setValue] = useState('');
  const [namesMatch, setNamesMatch] = useState(false);
  const { channel, server } = data as DeleteChannelModalData;

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();

  const isDisabled = isSubmitting || !namesMatch;
  const isModalOpen = isOpen && type === 'deleteChannel';

  const onDeleteChannel = async () => {
    if (!namesMatch) return;

    try {
      const query = new URLSearchParams({
        serverId: server?.id ?? '',
      });

      await axios.delete(`/api/socket/channels/${channel?.id}?${query}`);
      onClose();
      router.refresh();
      router.push(`/servers/${server?.id}`);
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
            Delete Channel
          </DialogTitle>

          <DialogDescription className='text-center text-muted-foreground'>
            Are you sure you want to do this?{' '}
            <span className='font-semibold text-teal-500'>{channel?.name}</span>{' '}
            will be permanently deleted.
          </DialogDescription>
        </DialogHeader>

        <form
          id='form_delete-channel'
          onSubmit={handleSubmit(onDeleteChannel)}
          className='flex flex-col space-y-4 mt-4'
        >
          <Label className='text-muted-foreground'>
            Please type <span className='text-teal-500'>{channel?.name}</span>{' '}
            to delete the channel.
          </Label>
          <Input
            type='text'
            autoComplete='off'
            disabled={isSubmitting}
            placeholder={channel?.name}
            value={value}
            onChange={(e) => {
              const val = e.target.value;

              if (val === channel?.name) {
                setNamesMatch(true);
              } else {
                setNamesMatch(false);
              }

              setValue(val);
            }}
          />

          <DialogFooter className='py-4'>
            <Button
              type='button'
              onClick={onClose}
              disabled={isDisabled}
              variant='ghost'
            >
              Cancel
            </Button>
            <Button
              form='form_delete-channel'
              type='submit'
              // onClick={onDeleteChannel}
              disabled={isDisabled}
              variant='danger'
            >
              {!isSubmitting ? 'Delete' : 'Deleting...'}
              {isSubmitting && (
                <Loader2 className='w-4 h-4 ml-2 animate-spin text-rose-50' />
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
