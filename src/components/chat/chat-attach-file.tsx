'use client';

import { Camera, FileSpreadsheetIcon, Film, Paperclip } from 'lucide-react';
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
import { ActionTooltip } from '../action-tooltip';

interface MessageFileModalProps {
  apiUrl: string;
  query: Record<string, string>;
  channelId: string;
  member: Member;
  addOptimisticMessage: (message: Message & { member: Member }) => void;
}

export function MessageFileUpload({
  apiUrl,
  query,
  channelId,
  member,
  addOptimisticMessage,
}: MessageFileModalProps) {
  const { onOpen } = useModalStore();

  const onUploadImage = () =>
    onOpen({
      type: ModalType.MESSAGE_FILE,
      data: {
        type: 'image',
        apiUrl,
        query,
        channelId,
        member,
        addOptimisticMessage,
      },
    });

  const onUploadVideo = () =>
    onOpen({
      type: ModalType.MESSAGE_FILE,
      data: {
        type: 'video',
        apiUrl,
        query,
        channelId,
        member,
        addOptimisticMessage,
      },
    });

  const onUploadPdf = () =>
    onOpen({
      type: ModalType.MESSAGE_FILE,
      data: {
        type: 'pdf',
        apiUrl,
        query,
        channelId,
        member,
        addOptimisticMessage,
      },
    });

  return (
    <DropdownMenu>
      <ActionTooltip label='Attach files'>
        <DropdownMenuTrigger asChild>
          <button
            type='button'
            className='h-[20px] w-[20px] transition p-0.5 flex items-center justify-center text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300'
          >
            <Paperclip />
          </button>
        </DropdownMenuTrigger>
      </ActionTooltip>

      <DropdownMenuContent side='top'>
        <DropdownMenuLabel>Upload File</DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className='px-3 py-2 text-sm cursor-pointer hover:text-teal-500'
          onClick={onUploadImage}
        >
          <Camera className='w-4 h-4 text-teal-500 mr-2' />
          Upload Image
        </DropdownMenuItem>

        <DropdownMenuItem
          className='px-3 py-2 text-sm cursor-pointer hover:text-rose-500'
          onClick={onUploadVideo}
        >
          <Film className='w-4 h-4 text-rose-500 mr-2' />
          Upload Video
        </DropdownMenuItem>

        <DropdownMenuItem
          className='px-3 py-2 text-sm cursor-pointer hover:text-indigo-500'
          onClick={onUploadPdf}
        >
          <FileSpreadsheetIcon className='w-4 h-4 text-indigo-500 mr-2' />
          Upload PDF File
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
