import { JoinServerModal } from '@/components/modals/join-server-modal';
import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { redirectToSignIn } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { Metadata } from 'next';

type InviteCodePageProps = {
  params: {
    inviteCode: string;
  };
};

export async function generateMetadata({
  params,
}: InviteCodePageProps): Promise<Metadata> {
  const server = await db.server.findFirst({
    where: {
      inviteCode: params.inviteCode,
    },
    select: {
      name: true,
    },
  });

  return {
    title: `Join ${server?.name ?? 'Server'}!`,
  };
}

export default async function InviteCodePage({ params }: InviteCodePageProps) {
  if (!params.inviteCode) {
    return redirect('/');
  }

  const headersList = headers();
  const domain = headersList.get('x-forwarded-host') || '';
  const protocol = headersList.get('x-forwarded-proto') || '';
  const pathname = headersList.get('x-invoke-path') || '';
  const fullUrl = `${protocol}://${domain}${pathname}`;

  const profile = await currentProfile();

  if (!profile) {
    return redirectToSignIn({ returnBackUrl: pathname });
  }

  const server = await db.server.findFirst({
    where: {
      inviteCode: params.inviteCode,
    },
    include: {
      members: {
        select: {
          profileId: true,
        },
      },
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
  return (
    <JoinServerModal
      serverId={server.id}
      inviteCode={params.inviteCode}
      name={server.name}
      memberCount={server.members.length}
      imageUrl={server.imageUrl}
    />
  );
}
