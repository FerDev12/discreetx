'use client';

import { Check, Copy, RefreshCw } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useModalStore } from '@/hooks/use-modal-store';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useOrigin } from '@/hooks/use-origin';
import { useState } from 'react';
import axios from 'axios';
import { cn } from '@/lib/utils';

export default function InviteModal() {
  const {
    isOpen,
    onClose,
    onOpen,
    type,
    data: { server },
  } = useModalStore();
  const origin = useOrigin();

  const isModalOpen = isOpen && type === 'invite';

  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const inviteUrl = `${origin}/invite/${server?.inviteCode}`;

  const onCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  const onNew = async () => {
    try {
      setIsLoading(true);

      const { data } = await axios.patch(
        `/api/servers/${server?.id}/invite-code`
      );

      onOpen('invite', { server: data });
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
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className=' p-0 overflow-hidden'>
        <DialogHeader className='pt-8 px-6'>
          <DialogTitle className='text-2xl text-center font-bold'>
            Invite Friends
          </DialogTitle>
        </DialogHeader>

        <DialogFooter className='justify-start sm:justify-start'>
          <div className='p-6 w-full'>
            <Label className='uppercase text-xs font-bold text-muted-foreground'>
              Server Invite Link
            </Label>
            <div className='flex items-center mt-2 gap-x-2'>
              <Input disabled={isLoading} readOnly value={inviteUrl} />

              <Button disabled={isLoading} size='icon' onClick={onCopy}>
                {copied ? (
                  <Check className='w-4 h-4' />
                ) : (
                  <Copy className='w-4 h-4' />
                )}
              </Button>
            </div>

            <Button
              disabled={isLoading}
              variant='link'
              size='sm'
              className='text-xs mt-4'
              onClick={onNew}
            >
              Generate a new link
              {/* <span className='relative'> */}
              <RefreshCw
                className={cn(
                  'w-4 h-4 ml-2',
                  isLoading && 'animate-spin stroke-teal-400'
                )}
              />
              {/* </span> */}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
