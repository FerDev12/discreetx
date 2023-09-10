'use client';

import { useNotificationsSocket } from '@/hooks/sockets/use-notifications-socket';
import { useServerSocket } from '@/hooks/sockets/use-server-socket';

type ServerSocketProps = {
  serverId: string;
  profileId: string;
};

export function ServerSocket({ serverId, profileId }: ServerSocketProps) {
  useServerSocket({ serverId });
  useNotificationsSocket({ serverId, profileId });
  return <></>;
}
