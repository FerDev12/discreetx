import { redirect } from 'next/navigation';

import { db } from '@/lib/db';
import { initialProfile } from '@/lib/initial-profile';
import InitialModal from '@/components/modals/initial-modal';
import { Metadata } from 'next';
import { redirectToSignIn } from '@clerk/nextjs';

export const metadata: Metadata = {
  title: 'Create Your First Server',
};

export default async function SetupPage() {
  const profile = await initialProfile();

  if (!profile) {
    return redirectToSignIn();
  }

  const server = await db.server.findFirst({
    where: {
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
  });

  if (server) {
    redirect(`/servers/${server.id}`);
  }

  return <InitialModal />;
}
