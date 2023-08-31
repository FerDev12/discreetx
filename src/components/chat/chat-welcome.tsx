import { Hash } from 'lucide-react';

type ChatWelcomeProps = {
  name: string;
  type: 'channel' | 'conversation';
};

export function ChatWelcome({ name, type }: ChatWelcomeProps) {
  return (
    <div className='space-y-2 px-4 mb-4'>
      {type === 'channel' && (
        <div className='w-[75px] h-[75px] rounded-full bg-zinc-500 dark:bg-zinc-700 flex items-center justify-center'>
          <Hash className='h-12 w-12 text-zinc-50' />
        </div>
      )}

      <p className='text-xl md:text-3xl font-bold'>
        {type === 'channel' ? `Welcome to #${name}` : name}
      </p>
      <p className='text-zinc-600 dark:text-zinc-400 text-sm'>
        {type === 'channel'
          ? `This is the start of the #${name} channel.`
          : `This is the start of your conversation with ${name}`}
      </p>
    </div>
  );
}
