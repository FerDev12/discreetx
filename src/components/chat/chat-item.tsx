'use client';

import { Member, MemberRole, Profile } from '@prisma/client';
import { UserAvatar } from '../user-avatar';
import { ActionTooltip } from '../action-tooltip';
import { ReactNode, useEffect, useState } from 'react';
import { Edit, FileIcon, ShieldAlert, ShieldCheck, Trash } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem } from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import axios from 'axios';

type ChatItemProps = {
  id: string;
  content: string;
  member: Member & {
    profile: Profile;
  };
  timestamp: string;
  fileUrl: string | null;
  deleted: boolean;
  currentMember: Member;
  isUpdated: boolean;
  socketUrl: string;
  socketQuery: Record<string, string>;
};

const roleIconMap = new Map<MemberRole, ReactNode>();
roleIconMap.set('GUEST', null);
roleIconMap.set(
  'MODERATOR',
  <ShieldCheck className='w-4 h-4 ml-2 text-indigo-500' />
);
roleIconMap.set(
  'ADMIN',
  <ShieldAlert className='w-4 h-4 ml-2 text-rose-500' />
);

const formSchema = z.object({
  content: z.string().min(1),
});

export function ChatItem({
  id,
  content,
  member,
  timestamp,
  fileUrl,
  deleted,
  currentMember,
  isUpdated,
  socketQuery,
  socketUrl,
}: ChatItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeliting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    // @ts-ignore
    resolver: zodResolver(formSchema),
    defaultValues: {
      content,
    },
  });

  useEffect(() => {
    form.reset({
      content,
    });
  }, [content, form]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.keyCode === 27) {
        setIsEditing(false);
      }
    };

    addEventListener('keydown', handleKeyDown);

    return () => removeEventListener('keydown', handleKeyDown);
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const query = new URLSearchParams({ ...socketQuery });

      await axios.patch(`/${socketUrl}/${id}?${query}`);
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        console.error(err.response?.data);
      } else {
        console.error(err);
      }
    }
  };

  const fileType = fileUrl?.split('.').at(-1);

  const isAdmin = currentMember.role === MemberRole.ADMIN;
  const isModerator = currentMember.role === MemberRole.MODERATOR;
  const isOwner = currentMember.id === member.id;
  const canDeleteMessage = !deleted && (isAdmin || isModerator || isOwner);
  const canEditMessage = !deleted && isOwner && !fileUrl;
  const isPDF = fileType === 'pdf' && fileUrl;
  const isImage = fileType !== 'pdf' && fileUrl;

  return (
    <li className='relative group flex items-center hover:bg-black/5 p-4 transition w-full'>
      <div className='group flex gap-x-2 items-start w-full'>
        <div className='cursor-pointer hover:drop-shadow-md transition'>
          <UserAvatar src={member.profile.imageUrl} />
        </div>

        <div className='flex flex-col w-full'>
          <div className='flex items-center gap-x-2'>
            <div className='flex items-center'>
              <p className='font-semibold text-sm hover:underline cursor-pointer'>
                {member.profile.name}
              </p>

              <ActionTooltip label={member.role}>
                {roleIconMap.get(member.role)}
              </ActionTooltip>
            </div>

            <span className='text-xs text-zinc-500 dakr:text-zinc-400'>
              {timestamp}
            </span>
          </div>

          {isImage && (
            <a
              href={fileUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='relative aspect-square rounded-md mt-2 overflow-hidden border flex items-center bg-secondary h-48 w-48'
            >
              <Image
                src={fileUrl}
                alt={content}
                fill
                className='object-cover'
              />
            </a>
          )}

          {isPDF && (
            <a>
              <div className='relative flex items-center p-2 mt-2 rounded-md bg-bakcground/10 bg-indigo-50'>
                <FileIcon className='h-10 w-10 fill-indigo-200 stroke-indigo-400 ' />
                <a
                  href={fileUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='ml-2 text-start text-sm text-indigo-500 dark:text-indigo-400 hover:underline'
                >
                  PDF File
                </a>
              </div>
            </a>
          )}

          {!fileUrl && !isEditing && (
            <p
              className={cn(
                'text-sm text-zinc-600 dark:text-zinc-300',
                deleted &&
                  'italic text-zinc-500 dark:text-zinc-400 text-xs mt-1'
              )}
            >
              {content}

              {isUpdated && !deleted && (
                <span className='text-[10px] mx-2 text-zinc-500 dark:text-zinc-400'>
                  {'(edited)'}
                </span>
              )}
            </p>
          )}

          {!fileUrl && isEditing && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='flex items-center w-full gap-x-2 pt-2'
              >
                <FormField
                  control={form.control}
                  name='content'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormControl>
                        <div className='relative w-full'>
                          <Input
                            {...field}
                            disabled={form.formState.isSubmitting}
                            placeholder='Edited message'
                            className='p-2 bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200'
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button
                  type='button'
                  disabled={form.formState.isSubmitting}
                  size='sm'
                  variant='ghost'
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  size='sm'
                  disabled={form.formState.isSubmitting}
                  variant='primary'
                >
                  Save
                </Button>
              </form>

              <span>Press escape to cancel, enter to save</span>
            </Form>
          )}
        </div>
      </div>

      {canDeleteMessage && (
        <div className='hidden group-hover:flex items-center gap-x-2 absolute p-1 -top-2 right-5 bg-white dark:bg-zinc-800 border rounded-sm'>
          {canEditMessage && (
            <ActionTooltip label='Edit'>
              <Edit
                onClick={() => setIsEditing(true)}
                className='cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition'
              />
            </ActionTooltip>
          )}

          <ActionTooltip label='Delete'>
            <Trash className='cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition' />
          </ActionTooltip>
        </div>
      )}
    </li>
  );
}
