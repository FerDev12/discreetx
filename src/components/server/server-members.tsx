'use client';

import { ServerMember } from './server-member';
import { useMembersQuery } from '@/hooks/queries/use-members-query';
import { Member, MemberRole } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';

export function ServerMembers({ currentMember }: { currentMember: Member }) {
  const {
    data: server,
    isLoading,
    isError,
  } = useMembersQuery({
    member: currentMember,
  });
  const { memberId } = useParams();

  const members = useMemo(() => {
    if (!server) return null;

    const orderedServerMembers = server.members.sort((a, b) => {
      if (
        a.role === MemberRole.ADMIN &&
        (b.role === MemberRole.MODERATOR || b.role === MemberRole.GUEST)
      ) {
        return -1;
      }

      if (a.role === MemberRole.MODERATOR && b.role === MemberRole.GUEST) {
        return -1;
      }

      if (a.id === currentMember.id && b.role === MemberRole.GUEST) return -1;

      return 0;
    });

    return orderedServerMembers.map((member) => {
      if (member.id === currentMember.id) {
        return (
          <ServerMember
            key={member.id}
            currentMember={currentMember}
            member={member}
          />
        );
      }

      const badgeCount = server.conversations
        .find((convo) => {
          return (
            (convo.memberOneId === member.id ||
              convo.memberOneId === currentMember.id) &&
            (convo.memberTwoId === member.id ||
              convo.memberTwoId === currentMember.id)
          );
        })
        ?.directMessages.filter(
          (message) => message.memberId !== currentMember.id
        )?.length;

      if (memberId && memberId === member.id) {
        return (
          <ServerMember
            key={member.id}
            currentMember={currentMember}
            member={member}
          />
        );
      }

      return (
        <ServerMember
          key={member.id}
          currentMember={currentMember}
          member={member}
          badgeCount={badgeCount === 0 ? undefined : badgeCount}
        />
      );
    });
  }, [currentMember, server, memberId]);

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
