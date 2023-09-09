'use client';

import { ServerMember } from './server-member';
import { useMembersQuery } from '@/hooks/queries/use-members-query';
import { MemberWithProfile } from '@/types';
import { Loader2 } from 'lucide-react';
import { useMemo } from 'react';

export function ServerMembers({
  currentMember,
}: {
  currentMember: MemberWithProfile;
}) {
  const {
    data: server,
    isLoading,
    isError,
  } = useMembersQuery({
    member: currentMember,
  });

  const members = useMemo(() => {
    if (!server) return null;

    return server.members.map((member) => {
      if (member.id === currentMember.id) {
        return (
          <ServerMember
            key={member.id}
            currentMember={currentMember}
            member={member}
          />
        );
      }

      const badgeCount = server.conversations.find(
        (c) => c.memberOneId === member.id
      )?.directMessages.length;

      return (
        <ServerMember
          key={member.id}
          currentMember={currentMember}
          member={member}
          badgeCount={badgeCount}
        />
      );
    });
  }, [currentMember, server]);

  if (isError) {
    return null;
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center p-4'>
        <Loader2 className='w-4 h-4 animate-spin text-muted-foreground' />
      </div>
    );
  }

  return <>{members}</>;
}
