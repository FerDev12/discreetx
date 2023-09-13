import { redirectToSignIn } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { ChannelIdPageChildren } from './page-children';
import { Metadata } from 'next';

type ChannelIdPageProps = {
  params: {
    serverId: string;
    channelId: string;
  };
};

export async function generateMetadata({
  params: { channelId },
}: ChannelIdPageProps): Promise<Metadata> {
  const channel = await db.channel.findUnique({
    where: {
      id: channelId,
    },
    select: {
      name: true,
    },
  });

  return {
    title: `# ${channel?.name}`,
  };
}

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
    <ChannelIdPageChildren channel={channel} member={{ ...member, profile }} />
  );
}
