'use client';

import { useSocket } from './providers/socket-provider';
import { Badge } from './ui/badge';

export function SocketIndicator() {
  const { isConnected } = useSocket();

  // return (
  //   <div
  //     className={cn(
  //       'w-2 h-2 rounded-full',
  //       isConnected ? 'bg-teal-500' : 'bg-yellow-600'
  //     )}
  //   />
  // );
  if (!isConnected) {
    return (
      <Badge
        variant='outline'
        className='bg-yellow-600 text-yellow-50 border-none'
      >
        Polling
      </Badge>
    );
  }
  return (
    <Badge variant='outline' className='bg-teal-600 text-teal-50 border-none'>
      Live
    </Badge>
  );
}
