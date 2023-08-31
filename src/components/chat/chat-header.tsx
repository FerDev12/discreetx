import { Hash } from 'lucide-react';

import { MobileToggle } from '@/components/mobile-toggle';
import { UserAvatar } from '../user-avatar';

type ChatHeaderProps = {
  serverId: string;
  name: string;
} & (
  | {
      type: 'conversation';
      imageUrl: string;
    }
  | {
      type: 'channel';
      imageUrl?: string;
    }
);

export function ChatHeader({
  serverId,
  name,
  type,
  imageUrl,
}: ChatHeaderProps) {
  return (
    <header className='text-md font-semibold px-3 flex items-center h-12 border-neutral-200 dark:border-neutral-800 border-b-2'>
      <MobileToggle serverId={serverId} />

      {type === 'channel' && (
        <Hash className='w-5 h-5 text-muted-foreground mr-2' />
      )}

      {type === 'conversation' && (
        <UserAvatar src={imageUrl} className='w-8 h-8 md:w-8 md:h-8' />
      )}

      <h3 className='font-semibold text-md text-zinc-950'>{name}</h3>
    </header>
  );
}
