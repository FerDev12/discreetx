import { redirectToSignIn } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { ChatHeader } from '@/components/chat/chat-header';
import { ChatMessages } from '@/components/chat/chat-messages';
import { ChannelType } from '@prisma/client';
import { MediaRoom } from '@/components/media-room';

type ChannelIdPageProps = {
  params: {
    serverId: string;
    channelId: string;
  };
};

export default async function ChannelIdPage({
  params: { serverId, channelId },
}: ChannelIdPageProps) {
  const profile = await currentProfile();

  if (!profile) {
    return redirectToSignIn();
  }

  const [channelResponse, memberResponse] = await Promise.allSettled([
    db.channel.findUnique({
      where: {
        id: channelId,
      },
    }),
    db.member.findFirst({
      where: {
        serverId: serverId,
        profileId: profile.id,
      },
      include: {
        profile: true,
      },
    }),
  ]);

  if (
    channelResponse.status === 'rejected' ||
    !channelResponse.value ||
    memberResponse.status === 'rejected' ||
    !memberResponse.value
  ) {
    return redirect(`/server/${serverId}`);
  }

  const channel = channelResponse.value;
  const member = memberResponse.value;

  return (
    <section className='dark:bg-[#313338] flex flex-col h-svh'>
      <ChatHeader serverId={serverId} name={channel.name} type='channel' />

      {channel.type === ChannelType.TEXT && (
        <ChatMessages
          type='channel'
          profile={profile}
          currentMember={member}
          name={channel.name}
          chatId={channel.id}
          apiUrl='/api/messages'
          paramKey='channelId'
          paramValue={channel.id}
          socketUrl='/api/socket/messages'
          socketQuery={{
            channelId: channel.id,
            serverId: channel.serverId,
          }}
        />
      )}

      {channel.type === ChannelType.AUDIO && (
        <MediaRoom chatId={channel.id} audio={true} video={false} />
      )}

      {channel.type === ChannelType.VIDEO && (
        <MediaRoom chatId={channel.id} video={true} audio={false} />
      )}
    </section>
  );
}
