import { EyeOff } from 'lucide-react';

export default function NotFound() {
  return (
    <div className='flex flex-col flex-1 justify-center items-center'>
      <EyeOff className='w-7 h-7 text-zinc-500 mb-4' />
      <p className='text-xs text-zinc-500 dark:text-zinc-400'>
        Honestly!!! What were you looking for??? 🤨
      </p>
    </div>
  );
}
