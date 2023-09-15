'use client';

import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader, SendHorizonal } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import * as z from 'zod';

import { MessageFileUpload } from './chat-attach-file';
import { ActionTooltip } from '@/components/action-tooltip';
import { EmojiPicker } from '@/components/emoji-picker';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Member, Message } from '@prisma/client';
import { ChatAI } from './chat-ai';
import { Textarea } from '../ui/textarea';

type ChatInputProps = {
  apiUrl: string;
  query: Record<string, any>;
  name: string;
  currentMember: Member;
  chatId: string;
  lastMessage?: {
    memberId: string;
    content: string;
  };
  addOptimisticMessage: (message: Message & { member: Member }) => void;
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
  lastMessage,
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

  const isTyping = form.getValues('content').length > 0;

  useEffect(() => {
    if (type !== 'conversation') return;

    const query = new URLSearchParams({
      chatId: chatId,
      memberId: currentMember.id,
    });

    fetch(`/api/socket/direct-messages/is-typing?${query}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isTyping }),
    }).catch((err) => console.error(err));
  }, [type, isTyping, chatId, currentMember.id]);

  const setValue = (value: string) => form.setValue('content', value);

  const onSubmit = handleSubmit(async (values: z.infer<typeof formSchema>) => {
    try {
      form.setValue('content', '');
      form.setFocus('content');
      const date = new Date();

      addOptimisticMessage({
        id: uuidv4(),
        content: values.content,
        channelId: query.channelId,
        fileUrl: null,
        memberId: currentMember.id,
        member: currentMember,
        sent: false,
        deleted: false,
        updatedAt: date,
        createdAt: date,
      });

      const params = new URLSearchParams({
        ...query,
      });

      await axios.post(`${apiUrl}?${params}`, values);
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        console.error(err.response?.data);
      } else {
        console.error(err);
      }
    }
  });

  return (
    <footer className='relative pt-4 px-8 pb-4 bg-[#e3e5e8] dark:bg-[#1e1f22]'>
      <Form {...form}>
        <form id='form_send-message' onSubmit={onSubmit}>
          <FormField
            control={form.control}
            name='content'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    {...field}
                    autoComplete='off'
                    placeholder={`Message ${
                      type === 'conversation' ? name : `#${name}`
                    }`}
                    className={cn(
                      'px-4 bg-zinc-50 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-400 min-h-[40px] max-h-full text-sm pb-0 mb-0'
                    )}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </form>
      </Form>

      <div className='flex justify-between items-center mt-2 px-2'>
        <div className='flex gap-x-2'>
          <EmojiPicker
            onChange={(emoji: string) => {
              form.setValue('content', form.getValues('content') + emoji);
            }}
          />

          <MessageFileUpload
            apiUrl={apiUrl}
            query={query}
            channelId={chatId}
            member={currentMember}
            addOptimisticMessage={addOptimisticMessage}
          />

          <ChatAI
            apiUrl={apiUrl}
            query={query}
            channelId={chatId}
            member={currentMember}
            addOptimisticMessage={addOptimisticMessage}
            value={form.getValues('content')}
            setValue={setValue}
            lastMessage={lastMessage}
          />
        </div>

        <ActionTooltip label='Send'>
          <button
            type='submit'
            disabled={isSubmitting}
            form='form_send-message'
            className='text-muted-foreground hover:text-foreground transition-colors'
          >
            {!isSubmitting && <SendHorizonal className='h-5 w-5 ' />}
            {isSubmitting && <Loader className='h-5 w-5 animate-spin' />}
          </button>
        </ActionTooltip>
      </div>
    </footer>
  );
}
