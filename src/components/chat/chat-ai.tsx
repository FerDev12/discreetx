'use client';

import {
  ImageIcon,
  MessageSquarePlusIcon,
  ScrollTextIcon,
  ShellIcon,
} from 'lucide-react';
import { ActionTooltip } from '../action-tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ModalType, useModalStore } from '@/hooks/stores/use-modal-store';
import { Member, Message } from '@prisma/client';

interface ChatAIProps {
  apiUrl: string;
  query: Record<string, string>;
  channelId: string;
  member: Member;
  addOptimisticMessage: (message: Message & { member: Member }) => void;
}

export function ChatAI({
  apiUrl,
  query,
  channelId,
  member,
  addOptimisticMessage,
}: ChatAIProps) {
  const { onOpen } = useModalStore();

  const onGenerateResponse = () => {};

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

  const onCheckSpelling = () => {};

  return (
    <DropdownMenu>
      <ActionTooltip label='AI Assistant'>
        <DropdownMenuTrigger>
          <ShellIcon className='w-5 h-5 text-muted-foreground hover:text-teal-500 transition-colors' />
        </DropdownMenuTrigger>
      </ActionTooltip>

      <DropdownMenuContent side='top'>
        <DropdownMenuLabel>Options</DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className='px-3 py-2 text-sm cursor-pointer hover:text-teal-500 dark:hover:text-teal-500'
          onClick={onGenerateResponse}
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
          className='px-3 py-2 text-sm cursor-pointer hover:text-indigo-500 dark:hover:text-indigo-500'
          onClick={onCheckSpelling}
        >
          <ScrollTextIcon className='w-4 h-4 mr-2' />
          Check Spelling
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
