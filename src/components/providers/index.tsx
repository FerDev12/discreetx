'use client';

import { ReactNode } from 'react';

import { ThemeProvider } from './theme-provider';
import { ModalProvider } from './modal-provider';
import { SocketProvider } from './socket-provider';
import { QueryProvider } from './query-provider';
import { Toaster } from '@/components/ui/toaster';
import { Notifications } from '@/components/notification';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SocketProvider>
      <QueryProvider>
        <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
          <ModalProvider />
          {children}
          <Toaster />
          <Notifications />
        </ThemeProvider>
      </QueryProvider>
    </SocketProvider>
  );
}
