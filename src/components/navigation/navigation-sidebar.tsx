import { UserButton } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

import { NavigationItem } from './navitagion-item';
import { NavigationSearch } from './navigation-search';
import { NavigationAction } from '@/components/navigation/navigation-action';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ModeToggle } from '@/components/mode-toggle';
import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';

export async function NavigationSidebar() {
  const profile = await currentProfile();

  if (profile === null) {
    return redirect('/');
  }

  const servers = await db.server.findMany({
    where: {
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
    select: {
      id: true,
      name: true,
      imageUrl: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return (
    <nav className='space-y-4 flex flex-col items-center h-full text-primary w-full dark:bg-[#1e1f22] bg-[#e3e5e8] shadow-slate-900/30 shadow-sm py-3'>
      <NavigationAction />

      <Separator className='h-[2px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-10 mx-auto' />

      <NavigationSearch servers={servers} />

      <ScrollArea className='flex-1 w-full'>
        <ul>
          {servers.map((server) => (
            <NavigationItem
              key={server.id}
              id={server.id}
              imageUrl={server.imageUrl}
              name={server.name}
            />
          ))}
        </ul>
      </ScrollArea>

      <div className='pb-3 mt-auto flex items-center flex-col gap-y-4'>
        <ModeToggle />
        <UserButton
          afterSignOutUrl='/'
          appearance={{
            elements: {
              avatarBox: 'h-[48px] w-[48px]',
            },
          }}
        />
      </div>
    </nav>
  );
}
