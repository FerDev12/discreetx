'use client';

import { cn } from '@/lib/utils';
import { Member, MemberRole } from '@prisma/client';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { ReactNode } from 'react';
import { UserAvatar } from '../user-avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

type ServerMemberProps = {
  member: Member & { profile: { id: string; name: string; imageUrl: string } };
};

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

export function ServerMember({ member }: ServerMemberProps) {
  const params = useParams();
  const router = useRouter();

  const icon = roleIconMap.get(member.role);

  const onClick = () => {
    router.push(`/servers/${member.serverId}/conversations/${member.id}`);
  };

  const date = Date.now();
  const updatedAt = new Date(member.updatedAt).getTime();
  const isOnline = date - updatedAt < 60 * 1000;
  const isIdle = !isOnline && date - updatedAt < 60 * 5000;

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
          src={member.profile.imageUrl}
          className='w-8 h-8 md:w-8 md:h-8'
        />
        <p
          className={cn(
            'font-semibold text-sm text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition',
            params?.memberId === member.id &&
              'text-primary dark:text-zinc-200 dark:group-hover:text-zinc-50'
          )}
        >
          {member.profile.name}
        </p>
        {icon}
      </div>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div
              className={cn(
                'w-2 h-2 rounded-full bg-muted-foreground relative before:w-3 before:h-3 before:border before:rounded-full before:border-muted-foreground before:absolute before:left-1/2 before:top-1/2 before:-translate-x-1/2 before:-translate-y-1/2',
                isOnline && 'bg-teal-500  before:border-teal-500',
                isIdle && 'bg-yellow-500 before:border-yellow-500'
              )}
            />
          </TooltipTrigger>
          <TooltipContent side='right' sideOffset={8}>
            {isOnline ? 'online' : isIdle ? 'idle' : 'offline'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </button>
  );
}
