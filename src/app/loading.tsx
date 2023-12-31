import { Loader2 } from 'lucide-react';

export default function RootLoadingPage() {
  return (
    <div className='h-svh w-full flex items-center justify-center'>
      <Loader2 className='w-8 h-8 animate-spin text-teal-500' />
    </div>
  );
}
