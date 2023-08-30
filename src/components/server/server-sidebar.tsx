import { redirect } from 'next/navigation';
import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { Channel, ChannelType } from '@prisma/client';
import { ServerHeader } from './server-header';

type ServerSidebarProps = {
  serverId: string;
};

export async function ServerSidebar({ serverId }: ServerSidebarProps) {
  const profile = await currentProfile();

  if (!profile) {
    return redirect('/');
  }

  const server = await db.server.findUnique({
    where: {
      id: serverId,
    },
    include: {
      channels: {
        orderBy: {
          createdAt: 'asc',
        },
      },
      members: {
        include: {
          profile: true,
        },
        orderBy: {
          role: 'asc',
        },
      },
    },
  });

  if (!server) {
    return redirect('/');
  }

  const initState: Channel[][] = [[], [], []];

  const [textChannels, audioChannels, videoChannels] = server.channels.reduce(
    (prev, curr) => {
      switch (curr.type) {
        case ChannelType.TEXT:
          prev[0].push(curr);
          break;
        case ChannelType.AUDIO:
          prev[1].push(curr);
          break;
        case ChannelType.VIDEO:
          prev[2].push(curr);
          break;
        default:
          break;
      }

      return prev;
    },
    initState
  );

  const member = server.members.filter(
    (member) => member.profileId !== profile.id
  );

  const role = server.members.find(
    (member) => member.profileId === profile.id
  )?.role;

  return (
    <aside className='flex flex-col h-full text-primary w-full dark:bg-[#2b2d31] bg-[#f2f3f5]'>
      <ServerHeader server={server} role={role} />
    </aside>
  );
}
