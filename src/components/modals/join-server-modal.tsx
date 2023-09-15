'use client';

import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, ServerIcon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { MemberFileUpload } from '@/components/member-file-upload';

const formSchema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  avatarUrl: z.string().url().min(1, { message: 'Image is requried' }),
});

type JoinServerModalParams = {
  serverId: string;
  name: string;
  memberCount: number;
  imageUrl: string;
  inviteCode: string;
};

export function JoinServerModal({
  serverId,
  name,
  memberCount,
  imageUrl,
  inviteCode,
}: JoinServerModalParams) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [joinServer, setJoinServer] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      avatarUrl: '',
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

  const handleClose = () => {
    router.push('/');
  };

  const onJoin = async (values: z.infer<typeof formSchema>) => {
    if (isLoading) return;

    try {
      setIsLoading(true);

      const query = new URLSearchParams({
        serverId: serverId,
        inviteCode: inviteCode,
      });

      await axios.post(`/api/socket/members?${query}`, values);

      router.refresh();
      router.push(`/servers/${serverId}`);
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

  if (!isMounted) {
    return null;
  }

  return (
    <Dialog open onOpenChange={handleClose}>
      <DialogContent
        className='dark:bg-zinc-900 border-2 border-teal-500  overflow-hidden'
        hideCloseButton
      >
        <DialogHeader className='pt-8 px-6 items-center mb-4'>
          <div className='flex flex-col items-center gap-y-4 mb-4'>
            <Avatar className='h-12 w-12'>
              <AvatarImage src={imageUrl} alt='Server image' />
              <AvatarFallback>
                <ServerIcon />
              </AvatarFallback>
            </Avatar>

            <h2 className='text-xl text-teal-500 text-center font-semibold'>
              {name}
            </h2>
          </div>

          <DialogTitle className='text-2xl text-center font-bold'>
            Join Server?
          </DialogTitle>

          <DialogDescription className='text-sm text-muted-foreground'>
            {memberCount} members
          </DialogDescription>
        </DialogHeader>

        {joinServer && (
          <Form {...form}>
            <form
              id='form_join-server'
              onSubmit={form.handleSubmit(onJoin)}
              className='flex flex-col items-center space-y-8'
            >
              <FormField
                control={form.control}
                name='username'
                render={({ field }) => (
                  <FormItem className='w-full'>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        type='text'
                        autoComplete='off'
                        placeholder='How do you want to be called?'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='avatarUrl'
                render={({ field }) => (
                  <FormItem className='w-full flex flex-col items-center justify-center'>
                    <FormControl>
                      <MemberFileUpload onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        )}

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
                {isLoading ? 'Joining...' : 'Join Server!'}
                {isLoading && <Loader2 className='w-4 h-4 animate-spin' />}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
