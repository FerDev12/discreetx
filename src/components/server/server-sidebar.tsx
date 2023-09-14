import { Hash, Mic, ShieldAlert, ShieldCheck, Video } from 'lucide-react';
import { ReactNode } from 'react';

import { Channel, ChannelType, MemberRole } from '@prisma/client';
import { ServerHeader } from '@/components/server/server-header';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ServerSearch } from '@/components/server/server-search';
import { ServerSection } from '@/components/server/server-section';
import { ServerChannel } from '@/components/server/server-channel';
import { ServerSocket } from './server-socket';
import { currentProfile } from '@/lib/current-profile';
import { redirectToSignIn } from '@clerk/nextjs';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { ServerMembers } from './server-members';
import { getServer } from '@/lib/get-server';

const iconMap = new Map<ChannelType, ReactNode>();
iconMap.set(ChannelType.TEXT, <Hash className='mr-2 w-4 h-4' />);
iconMap.set(ChannelType.AUDIO, <Mic className='mr-2 w-4 h-4' />);
iconMap.set(ChannelType.VIDEO, <Video className='mr-2 w-4 h-4' />);

const roleIconMap = new Map<MemberRole, ReactNode | null>();
roleIconMap.set(MemberRole.GUEST, null);
roleIconMap.set(
  MemberRole.MODERATOR,
  <ShieldCheck className='mr-2 w-4 h-4 text-indigo-500' />
);
roleIconMap.set(
  MemberRole.ADMIN,
  <ShieldAlert className='mr-2 w-4 h-4 text-rose-500' />
);

export async function ServerSidebar({ serverId }: { serverId: string }) {
  const profile = await currentProfile();

  if (!profile) {
    return redirectToSignIn();
  }

  const server = await getServer(serverId, profile.id);

  if (!server) {
    return redirect('/');
  }

  const initState: Channel[][] = [[], [], []];

  const [textChannels, audioChannels, videoChannels] = server.channels?.reduce(
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

  const members = server.members?.filter(
    (member) => member.profileId !== profile.id
  );

  const currentMember = server.members.find(
    (member) => member.profileId === profile.id
  );

  if (!currentMember) {
    return redirect('/');
  }

  const role = server.members?.find(
    (member) => member.profileId === profile.id
  )?.role;

  return (
    <div className='flex flex-col h-full text-primary w-full dark:bg-[#2b2d31] bg-[#f2f3f5] pt-12 md:pt-0 shadow-zinc-500/50 shadow-sm'>
      <Separator className='md:hidden' />
      <ServerSocket serverId={server.id} profileId={profile.id} />

      <ServerHeader server={server} role={role} />

      <ScrollArea className='flex-1 px-3'>
        <div className='mt-2'>
          <ServerSearch
            data={[
              {
                label: 'Text Channels',
                type: 'channel',
                data: textChannels.map((channel) => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap.get(channel.type),
                })),
              },
              {
                label: 'Audio Channels',
                type: 'channel',
                data: audioChannels.map((channel) => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap.get(channel.type),
                })),
              },
              {
                label: 'Video Channels',
                type: 'channel',
                data: videoChannels.map((channel) => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap.get(channel.type),
                })),
              },
              {
                label: 'Members',
                type: 'member',
                data: members.map((member) => ({
                  id: member.id,
                  name: member.username,
                  icon: roleIconMap.get(member.role),
                })),
              },
            ]}
          />
        </div>

        <Separator className='bg-zinc-200 dark:bg-zinc-700 rounded-md my-2' />

        {!!textChannels.length && (
          <div className='mb-2'>
            <ServerSection
              sectionType='channels'
              channelType={ChannelType.TEXT}
              role={role}
              label='Text Channels'
              server={server}
            />

            {textChannels.map((channel) => (
              <ServerChannel
                key={channel.id}
                channel={channel}
                server={server}
                role={role}
              />
            ))}
          </div>
        )}

        {!!audioChannels.length && (
          <div className='mb-2'>
            <ServerSection
              sectionType='channels'
              channelType={ChannelType.AUDIO}
              role={role}
              label='Audio Channels'
              server={server}
            />

            {audioChannels.map((channel) => (
              <ServerChannel
                key={channel.id}
                channel={channel}
                server={server}
                role={role}
              />
            ))}
          </div>
        )}

        {!!videoChannels.length && (
          <div className='mb-2'>
            <ServerSection
              sectionType='channels'
              channelType={ChannelType.VIDEO}
              role={role}
              label='Video Channels'
              server={server}
            />

            {videoChannels.map((channel) => (
              <ServerChannel
                key={channel.id}
                channel={channel}
                server={server}
                role={role}
              />
            ))}
          </div>
        )}

        {!!members.length && (
          <div className='mb-2'>
            <ServerSection
              sectionType='members'
              role={role}
              label='Members'
              server={server}
            />

            <ServerMembers currentMember={currentMember} />
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
