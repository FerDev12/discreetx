import './globals.css';
import type { Metadata } from 'next';
import { Open_Sans } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Providers } from '@/components/providers';
import { AuthProvider } from '@/components/providers/auth-provider';

const font = Open_Sans({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Discreet',
  description:
    'DiscreetX is a Nextjs powered app based off of Discord. It features real-time communication using Socket.io as well as generative AI integrations for intelligent responses, image generation and grammar checks.',
  authors: [{ name: 'FerDev12' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <html lang='en' suppressHydrationWarning>
        <body className={cn(font.className, 'dark:bg-[#313338]')}>
          <Providers>{children}</Providers>
        </body>
      </html>
    </AuthProvider>
  );
}
