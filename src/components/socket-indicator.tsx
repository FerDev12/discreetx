'use client';

import { useSocket } from './providers/socket-provider';
import { Badge } from './ui/badge';

export function SocketIndicator() {
  const { isConnected } = useSocket();

  if (!isConnected) {
    return (
      <Badge
        variant='outline'
        className='bg-yellow-600 text-yellow-50 border-none'
      >
        Fallback: Polling every 1s
      </Badge>
    );
  }
  return (
    <Badge variant='outline' className='bg-teal-600 text-teal-50 border-none'>
      Live: Real-time-updates
    </Badge>
  );
}
