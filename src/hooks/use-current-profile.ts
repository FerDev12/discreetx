import { Profile } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';

export function useCurrentProfile() {
  const fetchPorifle = async () => {
    const res = await fetch('/api/profile');
    return await res.json();
  };

  const { data: profile } = useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: fetchPorifle,
  });

  return profile ?? null;
}
