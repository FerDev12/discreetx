import {
  MemberWithSimpleProfile,
  ServerWithMembersWithConversations,
} from '@/types';
import { Member, Server } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';

export function useMembersQuery({
  member,
}: {
  member: MemberWithSimpleProfile;
}) {
  const fetchMembers = async () => {
    const query = new URLSearchParams({
      memberId: member.id,
      serverId: member.serverId,
    });

    const res = await fetch(`/api/members?${query}`);
    return await res.json();
  };

  const { data, isLoading, isError } =
    useQuery<ServerWithMembersWithConversations>({
      queryKey: [`server:${member.serverId}:members`],
      queryFn: fetchMembers,
      refetchInterval: 1000 * 60,
    });

  return {
    data,
    isLoading,
    isError,
  };
}
