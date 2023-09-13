import { JoinServerModal } from '@/components/modals/join-server-modal';
import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { redirectToSignIn } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

type InviteCodePageProps = {
  params: {
    inviteCode: string;
  };
};

export default async function InviteCodePage({ params }: InviteCodePageProps) {
  if (!params.inviteCode) {
    return redirect('/');
  }

  const headersList = headers();
  const domain = headersList.get('x-forwarded-host') || '';
  const protocol = headersList.get('x-forwarded-proto') || '';
  const pathname = headersList.get('x-invoke-path') || '';
  const fullUrl = `${protocol}://${domain}${pathname}`;
  console.log({ fullUrl });

  const profile = await currentProfile();

  if (!profile) {
    return redirectToSignIn({ returnBackUrl: `${fullUrl}` });
  }

  const server = await db.server.findFirst({
    where: {
      inviteCode: params.inviteCode,
    },
    include: {
      members: true,
    },
  });

  if (!server) {
    return redirect(`/`);
  }

  const isMember =
    server.members.findIndex((member) => member.profileId === profile.id) !==
    -1;

  if (isMember) {
    return redirect(`/servers/${server.id}`);
  }

  // RETURN JOIN SERVER MODAL
  return <JoinServerModal server={server} />;
}
