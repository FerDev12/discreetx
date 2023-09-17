'use client';
import { ServerCrash } from 'lucide-react';

export default function ErrorPage() {
  return (
    <div className='h-svh w-full flex items-center justify-center'>
      <div className='flex flx-col items-center space-y-2 text-muted-foreground text-center'>
        <ServerCrash className='w-10 h-10' />
        <p className='font-medium text-lg'>Something went wrong!</p>
      </div>
    </div>
  );
}
