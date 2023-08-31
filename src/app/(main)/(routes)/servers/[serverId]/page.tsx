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

  const channel = await db.channel.findFirst({
    where: {
      profileId: profile.id,
      name: 'general',
      serverId: params.serverId,
    },
  });

  if (channel) {
    return redirect(`/servers/${params.serverId}/channels/${channel.id}`);
  }

  return null;
}
