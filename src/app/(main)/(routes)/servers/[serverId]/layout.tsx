import { redirectToSignIn } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

import { ServerSidebar } from '@/components/server/server-sidebar';
import { currentProfile } from '@/lib/current-profile';
import { getServer } from '@/lib/get-server';

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

  const server = await getServer(params.serverId, profile.id);

  if (!server) {
    return redirect('/');
  }

  return (
    <div>
      <aside className='hidden md:flex w-60 z-20 fixed flex-col inset-y-0'>
        <ServerSidebar serverId={server.id} />
      </aside>

      <section className='md:pl-60 dark:bg-[#313338] flex flex-col h-svh max-h-[100svh]'>
        {children}
      </section>
    </div>
  );
}
