import { Member } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';

type MemberWithSimpleProfile = Member & {
  profile: { id: string; name: string; imageUrl: string };
};

export function useMembersQuery({ member }: { member: Member }) {
  const fetchMembers = async () => {
    const query = new URLSearchParams({
      memberId: member.id,
      serverId: member.serverId,
    });

    const res = await fetch(`/api/members?${query}`);
    return await res.json();
  };

  const { data, isLoading, isError } = useQuery<MemberWithSimpleProfile[]>({
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
