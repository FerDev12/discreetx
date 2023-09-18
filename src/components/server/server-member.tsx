'use client';

import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { ReactNode } from 'react';

import { UserAvatar } from '@/components/user-avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Member, MemberRole } from '@prisma/client';

const roleIconMap = new Map<MemberRole, ReactNode>();
roleIconMap.set(MemberRole.GUEST, null);
roleIconMap.set(
  MemberRole.MODERATOR,
  <ShieldCheck className='h-4 w-4 ml-2 text-indigo-500' />
);
roleIconMap.set(
  MemberRole.ADMIN,
  <ShieldAlert className='h-4 w-4 ml-2 text-rose-500' />
);

export function ServerMember({
  member,
  badgeCount,
  currentMember,
}: {
  currentMember: Member;
  member: Member;
  badgeCount?: number;
}) {
  const params = useParams();
  const router = useRouter();

  const icon = roleIconMap.get(member.role);

  const date = Date.now();
  const updatedAt = new Date(member.updatedAt).getTime();
  const isOnline = date - updatedAt < 60 * 1000;
  const isIdle = !isOnline && date - updatedAt < 60 * 5000;

  const onClick = () => {
    if (member.profileId === currentMember.profileId) return;
    router.push(`/servers/${member.serverId}/conversations/${member.id}`);
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'group p-2 rounded-md flex items-center justify-between w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1',
        params?.memberId === member.id && 'bg-zinc-700/20 dark:bg-zinc-700'
      )}
    >
      <div className='flex items-center gap-x-2'>
        <UserAvatar
          src={member.avatarUrl}
          className='w-8 h-8 md:w-8 md:h-8'
          badgeCount={badgeCount}
        />

        <div className='flex flex-col items-start'>
          <div className='flex items-center gap-x-1'>
            <p
              className={cn(
                'font-semibold text-sm text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition',
                params?.memberId === member.id &&
                  'text-primary dark:text-zinc-200 dark:group-hover:text-zinc-50',
                currentMember.id === member.id &&
                  'text-teal-500 dark:text-teal-500'
              )}
            >
              {member.username}
            </p>
            {icon}
          </div>

          {member.id === currentMember.id && (
            <span className='text-[8px]'>{'(YOU)'}</span>
          )}
        </div>
      </div>

      <div className='flex items-center gap-x-2'>
        <TooltipProvider>
          <Tooltip delayDuration={500}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  'w-2 h-2 rounded-full bg-muted-foreground relative before:w-3 before:h-3 before:border before:rounded-full before:border-muted-foreground before:absolute before:left-1/2 before:top-1/2 before:-translate-x-1/2 before:-translate-y-1/2',
                  isOnline &&
                    'bg-teal-500  before:border-teal-500 before:animate-pulse',
                  isIdle && 'bg-yellow-500 before:border-yellow-500'
                )}
              />
            </TooltipTrigger>
            <TooltipContent
              side='right'
              sideOffset={8}
              className={cn(
                'text-xs font-bold',
                isOnline && 'bg-teal-500 text-teal-50',
                isIdle && 'bg-yellow-500 text-yellow-50',
                !isOnline && !isIdle && 'bg-zinc-500 text-zinc-50'
              )}
            >
              {isOnline ? 'Online' : isIdle ? 'Idle' : 'Offline'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </button>
  );
}
