'use client';

import { cn } from '@/lib/utils';
import { Avatar, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';

type UserAvatarProps = {
  src?: string;
  className?: string;
  badgeCount?: number;
};

export function UserAvatar({ src, className, badgeCount }: UserAvatarProps) {
  return (
    <div className='relative'>
      {badgeCount !== undefined && (
        <span className='w-4 h-4 rounded-full absolute top-0 right-0 text-xs font-medium bg-rose-500 '>
          {badgeCount}
        </span>
      )}
      <Avatar className={cn('h-7 w-7 md:h-10 md:w-10', className)}>
        <AvatarImage src={src} />
      </Avatar>
    </div>
  );
}
