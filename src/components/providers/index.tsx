'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from './theme-provider';
import { ModalProvider } from './modal-provider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
      <ModalProvider />
      {children}
    </ThemeProvider>
  );
}
