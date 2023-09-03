import { Hash } from 'lucide-react';

export default function ChannelNotFound() {
  return (
    <div className='flex flex-col flex-1 justify-center items-center'>
      <Hash className='w-7 h-7 text-zinc-500 mb-4' />
      <p className='text-xs text-zinc-500 dark:text-zinc-400'>
        This channel does not exist or may have been deleted.
      </p>
    </div>
  );
}
