import { redirect } from 'next/navigation';
import { redirectToSignIn } from '@clerk/nextjs';

import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';

type ServerIdPageProps = {
  params: { serverId: string };
};

export default async function ServerIdPage({ params }: ServerIdPageProps) {
  const profile = await currentProfile();

  if (!profile) {
    return redirectToSignIn();
  }

  const server = await db.server.findUnique({
    where: {
      id: params.serverId,
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
    include: {
      channels: {
        where: {
          name: 'general',
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  if (!server) {
    return null;
  }

  const initialChannel = server.channels?.at(0);

  if (initialChannel) {
    return redirect(
      `/servers/${params.serverId}/channels/${initialChannel.id}`
    );
  }

  return null;
}
