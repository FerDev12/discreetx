import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { NavigationAction } from '@/components/navigation/navigation-action';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NavigationItem } from './navitagion-item';
import { ModeToggle } from '../mode-toggle';
import { UserButton } from '@clerk/nextjs';

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
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <nav className='space-y-4 flex flex-col items-center h-full text-primary w-full dark:bg-[#1e1f22] py-3'>
      <NavigationAction />

      <Separator className='h-[2px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-10 mx-auto' />

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
