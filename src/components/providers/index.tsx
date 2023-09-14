'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from './theme-provider';
import { ModalProvider } from './modal-provider';
import { Toaster } from '@/components/ui/toaster';
import { SocketProvider } from './socket-provider';
import { QueryProvider } from './query-provider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SocketProvider>
      <QueryProvider>
        <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
          <ModalProvider />
          {children}
          <Toaster />
        </ThemeProvider>
      </QueryProvider>
    </SocketProvider>
  );
}
