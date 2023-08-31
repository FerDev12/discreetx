import { redirectToSignIn } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { ChatHeader } from '@/components/chat/chat-header';
import { ChatInput } from '@/components/chat/chat-input';
import { ChatMessages } from '@/components/chat/chat-messages';

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

      <ChatMessages
        member={member}
        name={channel.name}
        type='channel'
        apiUrl='/api/messages'
        socketUrl='/api/socket/messages'
        socketQuery={{
          channelId: channel.id,
          serverId: channel.serverId,
        }}
        paramKey='channelId'
        paramValue={channel.id}
        chatId={channel.id}
      />

      <ChatInput
        name={channel.name}
        type='channel'
        apiUrl='/api/socket/messages'
        query={{
          channelId: channel.id,
          serverId: channel.serverId,
        }}
      />
    </section>
  );
}
