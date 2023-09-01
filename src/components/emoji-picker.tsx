'use client';

import { Smile } from 'lucide-react';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useTheme } from 'next-themes';
import { ActionTooltip } from './action-tooltip';
import { useState } from 'react';

type EmojiPickerProps = {
  onChange: (value: string) => void;
};

export function EmojiPicker({ onChange }: EmojiPickerProps) {
  const { resolvedTheme } = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <ActionTooltip label='Add emoji'>
        <PopoverTrigger>
          <Smile className='text-zinc-500 dark:text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 h-5 w-5' />
        </PopoverTrigger>
      </ActionTooltip>

      <PopoverContent
        side='right'
        sideOffset={-10}
        className='bg-transparent border-none shadow-none drop-shadow-none mb-8'
      >
        <Picker
          theme={resolvedTheme}
          data={data}
          onEmojiSelect={(emoji: any) => {
            onChange(emoji.native);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
