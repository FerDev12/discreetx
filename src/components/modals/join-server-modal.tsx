'use client';

import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useEffect, useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Member, Server } from '@prisma/client';
import { Loader2, ServerIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export function JoinServerModal({
  server,
}: {
  server: Server & { members: Member[] };
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  if (!isMounted) {
    return null;
  }

  const onJoin = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      const query = new URLSearchParams({
        serverId: server.id,
        inviteCode: server.inviteCode,
      });

      await axios.post(`/api/socket/members?${query}`);

      router.push(`/servers/${server.id}`);
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        console.error(err.response?.data);
      } else {
        console.log(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open>
      <DialogContent
        className='dark:bg-zinc-900 border-2 border-teal-500  overflow-hidden'
        hideCloseButton
      >
        <DialogHeader className='pt-8 px-6 items-center'>
          <Avatar className='h-12 w-12 mb-4'>
            <AvatarImage src={server.imageUrl} alt='Server image' />
            <AvatarFallback>
              <ServerIcon />
            </AvatarFallback>
          </Avatar>

          <DialogTitle className='text-2xl text-center font-bold'>
            Join{' '}
            <mark className='bg-none bg-transparent text-teal-500'>
              {server.name}
            </mark>
            ?
          </DialogTitle>

          <DialogDescription className='text-sm text-muted-foreground'>
            {server.members.length} members
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant='ghost'
            disabled={isLoading}
            onClick={() => router.push(`/`)}
          >
            No
          </Button>
          <Button variant='primary' disabled={isLoading} onClick={onJoin}>
            {!isLoading ? 'Join Server' : 'Joining...'}
            {isLoading && <Loader2 className='w-4 h-4 animate-spin ml-2' />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
