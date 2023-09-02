'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from './theme-provider';
import { ModalProvider } from './modal-provider';
import { SocketProvider } from './socket-provider';
import { QueryProvider } from './query-provider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
      {/* <SocketProvider> */}
      <ModalProvider />
      {/* <QueryProvider> */}
      {children}
      {/* </QueryProvider> */}
      {/* </SocketProvider> */}
    </ThemeProvider>
  );
}
