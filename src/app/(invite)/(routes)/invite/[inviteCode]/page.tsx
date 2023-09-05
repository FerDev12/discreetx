import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { redirectToSignIn } from '@clerk/nextjs';
import { ServerCrash } from 'lucide-react';
import { redirect } from 'next/navigation';

type InviteCodePageProps = {
  params: {
    inviteCode: string;
  };
};

export default async function InviteCodePage({ params }: InviteCodePageProps) {
  if (!params.inviteCode) {
    return redirect('/');
  }

  const [profileResponse, existingServerResponse] = await Promise.allSettled([
    currentProfile(),
    db.server.findFirst({
      where: {
        inviteCode: params.inviteCode,
      },
      include: {
        members: true,
      },
    }),
  ]);

  if (profileResponse.status === 'rejected' || !profileResponse.value) {
    return redirectToSignIn();
  }

  if (existingServerResponse.status === 'rejected') {
    return redirect('/');
  }

  const profile = profileResponse.value;
  const existingServer = existingServerResponse.value;

  if (!existingServer) {
    return (
      <div className='flex flex-col flex-1 justify-center items-center'>
        <ServerCrash className='w-7 h-7 text-zinc-500 mb-4' />
        <p className='text-xs text-zinc-500 dark:text-zinc-400'>
          You sneeky peek! Invalid invite code
        </p>
      </div>
    );
  }

  if (
    existingServer.members.findIndex(
      (member) => member.profileId === profile.id
    ) === -1 &&
    existingServer.members.length < 100
  ) {
    const member = await db.member.create({
      data: {
        profileId: profile.id,
        serverId: existingServer.id,
      },
    });

    if (member) {
      return redirect(`/servers/${existingServer.id}`);
    }
    // const server = await db.server.update({
    //   where: {
    //     inviteCode: params.inviteCode,
    //   },
    //   data: {
    //     // CREATE NEW PROFILE
    //     members: {
    //       create: [
    //         {
    //           profileId: profile.id,
    //         },
    //       ],
    //     },
    //   },
    // });

    // if (server) {
    //   return redirect(`/servers/${server.id}`);
    // }
  }

  return null;
}
