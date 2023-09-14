import { Profile } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';

export function useCurrentProfile() {
  const { data: profile } = useQuery<Profile>(['profile'], {
    queryFn: async () => {
      const res = await fetch(`/api/profile`);
      return await res.json();
    },
  });

  return profile ?? null;
}
