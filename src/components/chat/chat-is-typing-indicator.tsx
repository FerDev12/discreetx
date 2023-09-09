'use client';

import { useConversationStore } from '@/hooks/stores/use-conversation-store';

export function ChatIsTyping() {
  const { isTyping } = useConversationStore();

  if (!isTyping) return null;

  return (
    <span className='text-xs text-zinc-500 list-none  italic flex items-baseline gap-x-1'>
      <p>is typing</p>
      <div className='flex gap-x-0.5 items-baseline'>
        <span className=' animate-ping delay-0 w-0.5 h-0.5 bg-zinc-500 rounded-full' />
        <span className='animate-ping delay-50 w-0.5 h-0.5 bg-zinc-500 rounded-full' />
        <span className='animate-ping delay-100 w-0.5 h-0.5 bg-zinc-500 rounded-full' />
      </div>
    </span>
  );
}
