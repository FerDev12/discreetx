import { NavigationSidebar } from '@/components/navigation/navigation-sidebar';
import { ReactNode } from 'react';

export default async function MainLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div>
      <aside className='hidden md:flex w-[72px] z-30 flex-col fixed inset-y-0'>
        <NavigationSidebar />
      </aside>
      <main className='md:pl-[72px]'>{children}</main>
    </div>
  );
}
