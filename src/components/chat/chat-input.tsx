'use client';

import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, SendHorizonal } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import * as z from 'zod';

import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { EmojiPicker } from '@/components/emoji-picker';
import { useModalStore } from '@/hooks/use-modal-store';
import { ActionTooltip } from '@/components/action-tooltip';
import { MemberWithProfile, MessageWithMemberWithProfile } from '@/types';
import { Member } from '@prisma/client';

type ChatInputProps = {
  apiUrl: string;
  query: Record<string, any>;
  name: string;
  currentMember: MemberWithProfile;
  chatId: string;
  addOptimisticMessage: (message: MessageWithMemberWithProfile) => void;
} & (
  | {
      type: 'channel';
    }
  | {
      type: 'conversation';
      otherMember: Member;
    }
);

const formSchema = z.object({
  content: z.string().min(1),
});

export function ChatInput({
  apiUrl,
  query,
  name,
  type,
  currentMember,
  chatId,
  addOptimisticMessage,
}: ChatInputProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    // @ts-ignore
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const { onOpen } = useModalStore();

  const isTyping = form.getValues('content').length > 0;

  useEffect(() => {
    if (type !== 'conversation') return;

    const typingKey = `typing:${chatId}:${currentMember.id}`;

    fetch(`/api/socket/direct-messages/is-typing/${chatId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: typingKey,
        isTyping,
      }),
    }).catch((err) => console.error(err));
  }, [type, isTyping, chatId, currentMember.id]);

  const onSubmit = handleSubmit(async (values: z.infer<typeof formSchema>) => {
    form.reset();
    form.setFocus('content');
    const date = new Date();
    addOptimisticMessage({
      id: uuidv4(),
      content: values.content,
      channelId: query.channelId,
      fileUrl: null,
      memberId: currentMember.id,
      member: {
        ...currentMember,
      },
      deleted: false,
      updatedAt: date,
      createdAt: date,
    });

    try {
      const params = new URLSearchParams({
        ...query,
      });

      axios.post(`${apiUrl}?${params}`, values);
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        console.error(err.response?.data);
      } else {
        console.error(err);
      }
    }
  });

  return (
    <footer className='relative pt-4 px-4 pb-2 bg-[#e3e5e8] dark:bg-[#1e1f22]'>
      <Form {...form}>
        <form id='form_send-message' onSubmit={onSubmit}>
          <FormField
            control={form.control}
            name='content'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    type='text'
                    autoComplete='off'
                    placeholder={`Message ${
                      type === 'conversation' ? name : `#${name}`
                    }`}
                    className='px-8 bg-zinc-50 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-400'
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </form>
      </Form>

      <div className='flex justify-between items-center mt-2 px-2'>
        <div className='flex gap-x-2'>
          <ActionTooltip label='Attach file'>
            <button
              type='button'
              onClick={() =>
                onOpen('messageFile', {
                  apiUrl,
                  query,
                  channelId: query.channelId,
                  member: currentMember,
                })
              }
              className='h-[20px] w-[20px] bg-zinc-500 dark:bg-zinc-400 hover:bg-zinc-600 dark:hover:bg-zinc-300 transition rounded-full p-1 flex items-center justify-center'
            >
              <Plus className='text-zinc-50 dark:text-[#313338]' />
            </button>
          </ActionTooltip>

          <EmojiPicker
            onChange={(emoji: string) => {
              form.setValue('content', form.getValues('content') + emoji);
            }}
          />
        </div>

        <ActionTooltip label='Send'>
          <button
            type='submit'
            form='form_send-message'
            className='text-muted-foreground hover:text-foreground transition-colors'
          >
            <SendHorizonal className='h-5 w-5 ' />
          </button>
        </ActionTooltip>
      </div>
    </footer>
  );
}
