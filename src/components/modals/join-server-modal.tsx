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
import { ServerIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export function JoinServerModal({
  server,
}: {
  server: Server & { members: Member[] };
}) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  if (!isMounted) {
    return null;
  }

  const onJoin = async () => {
    try {
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
    }
  };

  return (
    <Dialog open>
      <DialogContent
        className='dark:bg-zinc-900 border-2 border-teal-500  overflow-hidden'
        hideCloseButton
      >
        <DialogHeader className='pt-8 px-6 items-center'>
          <Avatar>
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
          <Button variant='primary' onClick={onJoin}>
            Join Server
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
