'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from './theme-provider';
import { ModalProvider } from './modal-provider';
import { Toaster } from '@/components/ui/toaster';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
      <ModalProvider />
      {children}
      <Toaster />
    </ThemeProvider>
  );
}
