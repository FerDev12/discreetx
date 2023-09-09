'use client';

import { ServerMember } from './server-member';
import { useMembersQuery } from '@/hooks/queries/use-members-query';
import { MemberWithProfile } from '@/types';
import { Loader2 } from 'lucide-react';

export function ServerMembers({ member }: { member: MemberWithProfile }) {
  const {
    data: members,
    isLoading,
    isError,
  } = useMembersQuery({
    member,
  });

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

  return (
    <>
      {members?.map((member) => (
        <ServerMember key={member.id} member={member} />
      ))}
    </>
  );
}
