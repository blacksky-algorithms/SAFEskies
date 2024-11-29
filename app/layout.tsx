import type { Metadata } from 'next';
import { PublicLayout } from '@/components/layouts/public-layout';
import './globals.css';

import { Providers } from '@/contexts';
import { preferredLanguages } from '@/utils/todo';

export const metadata: Metadata = {
  title: 'Feed Moderator',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={preferredLanguages}>
      <body>
        <Providers>
          <PublicLayout>{children}</PublicLayout>
        </Providers>
      </body>
    </html>
  );
}
