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

  const [serverResponse, memberResponse] = await Promise.allSettled([
    db.server.findFirst({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
          },
        },
      },
      include: {
        channels: {
          where: {
            id: channelId,
          },
        },
        members: {
          include: {
            profile: true,
          },
        },
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
    serverResponse.status === 'rejected' ||
    !serverResponse.value ||
    memberResponse.status === 'rejected' ||
    !memberResponse.value
  ) {
    return redirect(`/`);
  }

  const server = serverResponse.value;
  const member = memberResponse.value;

  const channel = server.channels.find((ch) => ch.id === channelId);

  if (!channel) {
    return redirect(`servers/${serverId}`);
  }

  return (
    <>
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
          socketUrl={'/api/socket/messages'}
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
    </>
  );
}
