'use client';

import { cn } from '@/lib/utils';
import { Avatar, AvatarImage } from './ui/avatar';

type UserAvatarProps = {
  src?: string;
  className?: string;
  badgeCount?: number;
};

export function UserAvatar({ src, className, badgeCount }: UserAvatarProps) {
  return (
    <div className='relative'>
      {badgeCount !== undefined && (
        <span className='w-4 h-4 rounded-full absolute -top-1 -right-1 text-[10px] font-semibold bg-rose-500 z-10 text-rose-50'>
          {badgeCount}
        </span>
      )}
      <Avatar className={cn('h-7 w-7 md:h-10 md:w-10', className)}>
        <AvatarImage src={src} />
      </Avatar>
    </div>
  );
}
