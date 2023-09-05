import { redirect } from 'next/navigation';
import { redirectToSignIn } from '@clerk/nextjs';

import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import axios, { isAxiosError } from 'axios';

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
    axios
      .patch(`/api/socket/servers/${server.id}`, {
        eventType: 'server:member:joined',
      })
      .then((res) => res.data)
      .catch((err) =>
        console.error(isAxiosError(err) ? err.response?.data : err)
      );

    return redirect(
      `/servers/${params.serverId}/channels/${initialChannel.id}`
    );
  }

  return null;
}
