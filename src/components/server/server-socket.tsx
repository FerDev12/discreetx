'use client';
import { useServerSocket } from '@/hooks/sockets/use-server-socket';

type ServerSocketProps = {
  serverId: string;
  profileId: string;
};

export function ServerSocket({ serverId, profileId }: ServerSocketProps) {
  useServerSocket({ serverId, profileId });
  return <></>;
}
