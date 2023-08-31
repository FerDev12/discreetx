'use client';

import { cn } from '@/lib/utils';
import { Member, MemberRole, Profile, Server } from '@prisma/client';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { ReactNode } from 'react';
import { UserAvatar } from '../user-avatar';

type ServerMemberProps = {
  member: Member & { profile: Profile };
  server: Server;
};

const roleIconMap = new Map<MemberRole, ReactNode>();
roleIconMap.set(MemberRole.GUEST, null);
roleIconMap.set(
  MemberRole.MODERATOR,
  <ShieldCheck className='h-4 w-4 ml-2 text-indigo-500' />
);
roleIconMap.set(
  MemberRole.MODERATOR,
  <ShieldAlert className='h-4 w-4 ml-2 text-rose-500' />
);

export function ServerMember({ member, server }: ServerMemberProps) {
  const params = useParams();
  const router = useRouter();

  const icon = roleIconMap.get(member.role);

  return (
    <button
      onClick={() => {}}
      className={cn(
        'group p-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1',
        params?.memberId === member.id && 'bg-zinc-700/20 dark:bg-zinc-700'
      )}
    >
      <UserAvatar
        src={member.profile.imageUrl}
        className='w-8 h-8 md:w-8 md:h-8'
      />
      <p
        className={cn(
          'font-semibold text-sm text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition',
          params?.channelId === member.id &&
            'text-primary dark:text-zinc-200 dark:group-hover:text-zinc-50'
        )}
      >
        {member.profile.name}
      </p>
      {icon}
    </button>
  );
}
