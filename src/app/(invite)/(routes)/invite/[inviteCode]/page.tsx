import { JoinServerModal } from '@/components/modals/join-server-modal';
import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { redirectToSignIn } from '@clerk/nextjs';
import axios from 'axios';
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

  const profile = await currentProfile();

  if (!profile) {
    return redirectToSignIn();
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

  // const [profileResponse, existingServerResponse] = await Promise.allSettled([
  //   currentProfile(),
  //   db.server.findFirst({
  //     where: {
  //       inviteCode: params.inviteCode,
  //     },
  //     include: {
  //       members: true,
  //     },
  //   }),
  // ]);

  // if (profileResponse.status === 'rejected' || !profileResponse.value) {
  //   return redirectToSignIn();
  // }

  // if (
  //   existingServerResponse.status === 'rejected' ||
  //   !existingServerResponse.value
  // ) {
  //   return redirect(`/`);
  // }

  // const profile = profileResponse.value;
  // const existingServer = existingServerResponse.value;

  // const isMember =
  //   existingServer.members.findIndex(
  //     (member) => member.profileId === profile.id
  //   ) !== -1;

  // if (isMember) {
  //   return redirect(`/servers/${existingServer.id}`);
  // }

  // if (existingServer.members.length < 100) {
  //   const { SOCKET_IO_API_URL, SOCKET_IO_API_TOKEN } = process.env;
  //   if (!SOCKET_IO_API_URL || !SOCKET_IO_API_TOKEN) {
  //     const member = await db.member.create({
  //       data: {
  //         profileId: profile.id,
  //         serverId: existingServer.id,
  //       },
  //     });

  //     if (member) {
  //       return redirect(`/servers/${existingServer.id}`);
  //     }

  //     return redirect('/');
  //   }

  //   try {
  //     const { data } = await axios.post(
  //       `${SOCKET_IO_API_URL}/members`,
  //       {
  //         profileId: profile.id,
  //       },
  //       {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           Authorization: SOCKET_IO_API_TOKEN,
  //         },
  //       }
  //     );

  //     return redirect(`/servers/${data.id}`);
  //   } catch (err: any) {
  //     if (axios.isAxiosError(err)) {
  //       console.error(err.response?.data);
  //     } else {
  //       console.log(err);
  //     }
  //     return null;
  //   }

  //   // const server = await db.server.update({
  //   //   where: {
  //   //     inviteCode: params.inviteCode,
  //   //   },
  //   //   data: {
  //   //     // CREATE NEW PROFILE
  //   //     members: {
  //   //       create: [
  //   //         {
  //   //           profileId: profile.id,
  //   //         },
  //   //       ],
  //   //     },
  //   //   },
  //   // });
  //   // if (server) {
  //   //   return redirect(`/servers/${server.id}`);
  //   // }
  // }

  // return redirect('/');
}
