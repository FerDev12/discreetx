'use client';

import axios from 'axios';
import { useCompletion } from 'ai/react';
import {
  ImageIcon,
  Loader,
  MessageSquarePlusIcon,
  ScrollTextIcon,
  ShellIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import * as z from 'zod';

import { ActionTooltip } from '@/components/action-tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ModalType, useModalStore } from '@/hooks/stores/use-modal-store';
import { useToast } from '@/components/ui/use-toast';
import { Member, Message } from '@prisma/client';

const urlSchema = z.string().url();

const isUrl = (value: string) => urlSchema.safeParse(value).success;

interface ChatAIProps {
  apiUrl: string;
  query: Record<string, string>;
  channelId: string;
  member: Member;
  value: string;
  lastMessage?: {
    memberId: string;
    content: string;
  };
  setValue: (value: string) => void;
  addOptimisticMessage: (message: Message & { member: Member }) => void;
}

export function ChatAI({
  apiUrl,
  query,
  channelId,
  member,
  value,
  lastMessage,
  setValue,
  addOptimisticMessage,
}: ChatAIProps) {
  const { onOpen } = useModalStore();
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);

  const { complete, completion, isLoading } = useCompletion({
    api: '/api/openai/generate-response',
    onResponse: (res) => {
      setGenerating(true);
      if (res.status === 429) {
        console.error('Open AI rate limit reached');
        toast({
          title: 'Rate Limit Reached',
          description: 'Please try again later',
          variant: 'destructive',
        });
      }
    },
    onFinish: () => setGenerating(false),
  });

  useEffect(() => {
    if (generating) {
      setValue(completion);
    }
  }, [setValue, completion, generating]);

  const onGenerateResponse = async () => {
    if (!lastMessage) return;
    if (lastMessage.memberId === member.id) return;
    if (!lastMessage.content.length) return;
    if (isUrl(lastMessage.content)) return;

    try {
      complete(lastMessage.content);
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        return console.error(err.response?.data);
      }
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const onGenerateImage = () =>
    onOpen({
      type: ModalType.GENERATE_IMAGE,
      data: {
        apiUrl,
        query,
        channelId,
        member,
        addOptimisticMessage,
      },
    });

  const onCheckSpelling = async () => {
    if (!value.length) return;

    try {
      setGenerating(true);
      const { data } = await axios.post('/api/openai/check-grammar', {
        prompt: value,
      });
      setValue(data.response.replaceAll('"', ''));
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        return console.error(err.response?.data);
      }
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <DropdownMenu>
      <ActionTooltip label='AI Assistant'>
        <DropdownMenuTrigger>
          {!isLoading && !generating && (
            <ShellIcon className='w-5 h-5 text-muted-foreground hover:text-teal-500 transition-colors' />
          )}
          {(isLoading || generating) && (
            <div className='flex items-center space-x-2 text-muted-foreground'>
              <Loader className='w-5 h-5 animate-spin text-muted-foreground' />
              <p className='text-muted-foreground text-xs'>Generating...</p>
            </div>
          )}
        </DropdownMenuTrigger>
      </ActionTooltip>

      <DropdownMenuContent side='top'>
        <DropdownMenuLabel>AI Actions</DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className='px-3 py-2 text-sm cursor-pointer hover:text-teal-500 dark:hover:text-teal-500'
          onClick={onGenerateResponse}
          disabled={
            !lastMessage ||
            lastMessage.memberId === member.id ||
            isUrl(lastMessage.content)
          }
        >
          <MessageSquarePlusIcon className='w-4 h-4 mr-2' />
          Generate a response
        </DropdownMenuItem>

        <DropdownMenuItem
          className='px-3 py-2 text-sm cursor-pointer hover:text-rose-500 dark:hover:text-rose-500'
          onClick={onGenerateImage}
        >
          <ImageIcon className='w-4 h-4 mr-2' />
          Generate an image
        </DropdownMenuItem>

        <DropdownMenuItem
          className='px-3 py-2 text-sm cursor-pointer hover:text-indigo-500 dark:hover:text-indigo-500 flex space-x-2 items-center'
          onClick={onCheckSpelling}
          disabled={!value.length}
        >
          <ScrollTextIcon className='w-4 h-4' />
          <p>
            Check Spelling{' '}
            {!value.length && (
              <span className='text-xs[10px]'>{'(Write something first)'}</span>
            )}
          </p>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
