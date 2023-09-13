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
    select: {
      id: true,
      channels: {
        where: {
          name: 'general',
        },
        select: {
          id: true,
        },
      },
    },
    where: {
      id: params.serverId,
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
  });

  if (!server) {
    return redirect('/');
  }

  const initialChannel = server.channels?.at(0);

  if (initialChannel) {
    return redirect(
      `/servers/${params.serverId}/channels/${initialChannel.id}`
    );
  }

  return redirect(`/`);
}
