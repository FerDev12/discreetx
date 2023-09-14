'use client';

import { useRouter, useSearchParams } from 'next/navigation';
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
import { Input } from '../ui/input';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem } from '../ui/form';

const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  imageUrl: z.string().url().min(1, { message: 'Image is requried' }),
});

export function JoinServerModal({
  server,
}: {
  server: Server & { members: Member[] };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [joinServer, setJoinServer] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      imageUrl: '',
    },
  });

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    if (searchParams.get('join') === 'true') {
      setJoinServer(true);
    } else {
      setJoinServer(false);
    }
  }, [searchParams]);

  if (!isMounted) {
    return null;
  }

  const handleClose = () => {
    router.push('/');
  };

  const onJoin = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);

      const query = new URLSearchParams({
        serverId: server.id,
        inviteCode: server.inviteCode,
      });

      await axios.post(`/api/socket/members?${query}`);

      router.refresh();
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
    <Dialog open onOpenChange={handleClose}>
      <DialogContent
        className='dark:bg-zinc-900 border-2 border-teal-500  overflow-hidden'
        hideCloseButton
      >
        <DialogHeader className='pt-8 px-6 items-center'>
          <div className='flex flex-col gap-y-4 mb-4'>
            <Avatar className='h-12 w-12'>
              <AvatarImage src={server.imageUrl} alt='Server image' />
              <AvatarFallback>
                <ServerIcon />
              </AvatarFallback>
            </Avatar>

            <h2 className='text-lg text-teal-500 text-center'>{server.name}</h2>
          </div>

          {!joinServer ? (
            <>
              <DialogTitle className='text-2xl text-center font-bold'>
                Join Server?
              </DialogTitle>

              <DialogDescription className='text-sm text-muted-foreground'>
                {server.members.length} members
              </DialogDescription>
            </>
          ) : (
            <>
              <DialogTitle className='text-2xl text-center font-bold'>
                How do you want to be called?
              </DialogTitle>

              <Form {...form}>
                <form
                  id='form_join-server'
                  onSubmit={form.handleSubmit(onJoin)}
                >
                  <FormField
                    name='name'
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input type='text' {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </>
          )}
        </DialogHeader>

        <DialogFooter>
          {!joinServer ? (
            <>
              <Button
                type='button'
                variant='ghost'
                disabled={isLoading}
                onClick={handleClose}
              >
                No
              </Button>
              <Button
                type='button'
                variant='primary'
                disabled={isLoading}
                onClick={() => {
                  history.pushState(
                    {
                      join: true,
                    },
                    ''
                  );
                  setJoinServer(true);
                }}
              >
                Yes
              </Button>
            </>
          ) : (
            <>
              <Button
                type='button'
                variant='ghost'
                disabled={isLoading}
                onClick={() => {
                  history.pushState(
                    {
                      join: false,
                    },
                    ''
                  );
                  setJoinServer(false);
                }}
              >
                Back
              </Button>
              <Button
                type='submit'
                form='form_join-server'
                variant='primary'
                disabled={isLoading}
              >
                Join Server!
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
