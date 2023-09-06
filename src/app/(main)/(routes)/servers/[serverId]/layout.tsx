import { redirectToSignIn } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

import { QueryProvider } from '@/components/providers/query-provider';
import { SocketProvider } from '@/components/providers/socket-provider';
import { ServerSidebar } from '@/components/server/server-sidebar';
import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';

export default async function ServerIdLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { serverId: string };
}) {
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

  return (
    <SocketProvider>
      <QueryProvider>
        <div>
          <aside className='hidden md:flex w-60 z-20 fixed flex-col inset-y-0'>
            <ServerSidebar serverId={server.id} />
          </aside>

          <section className='md:pl-60 dark:bg-[#313338] flex flex-col h-svh max-h-[100svh]'>
            {children}
          </section>
        </div>
      </QueryProvider>
    </SocketProvider>
  );
}
