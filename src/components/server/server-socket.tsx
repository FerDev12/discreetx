'use client';
import { useServerSocket } from '@/hooks/use-server-socket';

type ServerSocketProps = {
  serverId: string;
};

export function ServerSocket({ serverId }: ServerSocketProps) {
  useServerSocket({ serverId: serverId });
  return <></>;
}
