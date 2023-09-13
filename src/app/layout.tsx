import './globals.css';
import type { Metadata } from 'next';
import { Open_Sans } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { Providers } from '@/components/providers';

const font = Open_Sans({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Discreet',
  description: 'A Next.js based Discord Clone App',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang='en' suppressHydrationWarning>
        <body className={cn(font.className, 'dark:bg-[#313338]')}>
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
