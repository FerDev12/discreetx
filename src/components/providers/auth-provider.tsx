import { ClerkProvider } from '@clerk/nextjs';
import { ReactNode } from 'react';
import { dark } from '@clerk/themes';

export async function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
    >
      {children}
    </ClerkProvider>
  );
}
