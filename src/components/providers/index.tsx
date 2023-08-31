'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { ModalProvider } from '@/components/providers/modal-provider';
import { SocketProvider } from '@/components/providers/socket-provider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
      <SocketProvider>
        <ModalProvider />
        {children}
      </SocketProvider>
    </ThemeProvider>
  );
}
