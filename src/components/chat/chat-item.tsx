'use client';

import axios from 'axios';
import {
  Check,
  CheckCheck,
  Edit,
  FileIcon,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  Trash,
  User,
} from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import {
  Fragment,
  ReactNode,
  experimental_useOptimistic,
  useEffect,
  useState,
} from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { UserAvatar } from '@/components/user-avatar';
import { ActionTooltip } from '@/components/action-tooltip';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ModalType, useModalStore } from '@/hooks/stores/use-modal-store';
import { cn } from '@/lib/utils';
import { Member, MemberRole, Profile } from '@prisma/client';

const urlSchema = z.string().url();
const isLink = (value: string) => urlSchema.safeParse(value).success;

type ChatItemProps = {
  id: string;
  content: string;
  member: Member & {
    profile: Profile;
  };
  sent: boolean;
  timestamp: string;
  fileUrl: string | null;
  deleted: boolean;
  currentMember: Member;
  isUpdated: boolean;
  socketUrl: string;
  socketQuery: Record<string, string>;
  deleteOptimisticMessage: (messageId: string) => void;
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
  sent,
  deleted,
  currentMember,
  isUpdated,
  socketQuery,
  socketUrl,
  deleteOptimisticMessage,
}: ChatItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const params = useParams();
  const router = useRouter();
  const [optimisticContent, setOptimisticContent] = experimental_useOptimistic(
    content,
    (_, content: string) => content
  );

  const onMemberClick = () => {
    if (member.id === currentMember.id) {
      return;
    }

    router.push(`/servers/${params?.serverId}/conversations/${member.id}`);
  };

  const { onOpen } = useModalStore();

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

  const onEditMessage = async (values: z.infer<typeof formSchema>) => {
    try {
      setOptimisticContent(values.content);
      form.reset();
      setIsEditing(false);
      const query = new URLSearchParams({ ...socketQuery });

      await axios.patch(`${socketUrl}/${id}?${query}`, values);
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
  const isImage =
    (['jpg', 'jpeg', 'png', 'webd'].includes(fileType ?? '') ||
      fileUrl?.includes('oaidalleapiprodscus.blob.core.windows.net')) &&
    fileUrl;
  const isVideo =
    ['mov', 'mp4', 'flv', 'wmv', 'ogg', 'webm'].includes(fileType ?? '') &&
    fileUrl;

  const messageContent = (
    <p
      className={cn(
        'text-sm text-zinc-600 dark:text-zinc-300',
        deleted && 'italic text-zinc-500 dark:text-zinc-400 text-xs mt-1'
      )}
    >
      {optimisticContent.split(' ').map((c, i) =>
        isLink(c) ? (
          <Fragment key={i}>
            <a
              href={c}
              target='_blank'
              rel='noopener noreferrer'
              className='text-indigo-500 text-sm hover:underline'
            >
              {c}
            </a>{' '}
          </Fragment>
        ) : (
          <Fragment key={i}>{c} </Fragment>
        )
      )}{' '}
      {isUpdated && !deleted && (
        <span className='text-[10px] mx-2 text-zinc-500 dark:text-zinc-400'>
          {'(edited)'}
        </span>
      )}
    </p>
  );

  return (
    <div>
      <li
        className={cn(
          'chat-item',
          'relative group flex hover:bg-black/5 p-4 transition w-full self-end'
        )}
      >
        <div className='group flex gap-x-2 items-start w-full'>
          <div
            onClick={onMemberClick}
            className='cursor-pointer hover:drop-shadow-md transition'
          >
            <UserAvatar src={member.avatarUrl} />
          </div>

          <div className='flex flex-col w-full'>
            <div className='flex items-center gap-x-2'>
              <div className='flex items-center'>
                <p
                  onClick={onMemberClick}
                  className={cn(
                    'font-semibold text-sm hover:underline cursor-pointer',
                    isOwner && 'dark:text-teal-300/90 text-teal-700/90'
                  )}
                >
                  {member.username}
                </p>

                <ActionTooltip label={member.role}>
                  {roleIconMap.get(member.role)}
                </ActionTooltip>

                {isOwner && (
                  <User className='w-4 h-4 ml-2 text-muted-foreground' />
                )}
              </div>

              <span className='text-xs text-zinc-500 dakr:text-zinc-400'>
                {timestamp}
              </span>

              {currentMember.id === member.id && !deleted && (
                <span>
                  {!sent && <Check className='w-4 h-4 text-muted-foreground' />}
                  {sent && (
                    <CheckCheck className='w-4 h-4 text-muted-foreground' />
                  )}
                </span>
              )}
            </div>

            {isImage && (
              <div>
                <a
                  href={fileUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='relative rounded-md my-2 bg-transparent flex items-center h-64 overflow-hidden'
                >
                  <Image
                    src={fileUrl}
                    alt={content}
                    fill
                    className='object-contain object-left'
                  />
                </a>
                {fileUrl !== optimisticContent && messageContent}
              </div>
            )}

            {isPDF && (
              <div className='mt-2'>
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
                {fileUrl !== content && messageContent}
              </div>
            )}

            {isVideo && (
              <div className='mt-2'>
                <div className='relative z-10 hover:border-red-500 hover:border-2 rounded-sm h-64 overflow-hidden aspect-video'>
                  <video
                    controls
                    muted
                    src={fileUrl}
                    className='absolute inset-0'
                  >
                    {/* <source src={fileUrl} type={`video/${fileType}`}></source> */}
                  </video>
                </div>
                {fileUrl !== content && messageContent}
              </div>
            )}

            {!fileUrl && !isEditing && messageContent}

            {!fileUrl && isEditing && (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onEditMessage)}
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
                              type='text'
                              autoComplete='off'
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
                    {form.formState.isSubmitting ? 'Saving...' : 'Save'}
                    {form.formState.isSubmitting && (
                      <Loader2 className='w-4 h-4 ml-2 animate-spin' />
                    )}
                  </Button>
                </form>

                <span className='text-xs text-muted-foreground mt-2'>
                  Press escape to cancel, enter to save
                </span>
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
              <Trash
                onClick={() =>
                  onOpen({
                    type: ModalType.DELETE_MESSAGE,
                    data: {
                      apiUrl: `${socketUrl}/${id}`,
                      query: socketQuery,
                      messageId: id,
                      deleteOptimisticMessage,
                    },
                  })
                }
                className='cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition'
              />
            </ActionTooltip>
          </div>
        )}
      </li>
      <Separator />
    </div>
  );
}
