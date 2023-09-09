import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { redirectToSignIn } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

export default async function ServerDashboardPage({
  params: { serverId },
}: {
  params: { serverId: string };
}) {
  const profile = await currentProfile();

  if (!profile) {
    return redirectToSignIn();
  }

  const server = await db.server.findUnique({
    where: {
      id: serverId,
      profileId: profile.id,
    },
    include: {
      members: {
        include: {
          profile: true,
        },
      },
      channels: true,
    },
  });

  if (!server) {
    return redirect('/');
  }

  return <></>;
}
