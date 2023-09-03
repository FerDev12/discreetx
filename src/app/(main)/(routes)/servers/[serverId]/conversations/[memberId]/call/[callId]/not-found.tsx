import { PhoneMissedIcon } from 'lucide-react';

export default function CallNotFound() {
  return (
    <div className='flex flex-col flex-1 justify-center items-center'>
      <PhoneMissedIcon className='w-7 h-7 text-zinc-500 mb-4' />
      <p className='text-xs text-zinc-500 dark:text-zinc-400'>
        This server does not seem to exist. Or it may have been deleted
      </p>
    </div>
  );
}
