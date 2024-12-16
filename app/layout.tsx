import type { Metadata } from 'next';
import { PublicLayout } from '@/components/layouts/public-layout';
import './globals.css';

import { Providers } from '@/contexts';
import { preferredLanguages } from '@/utils/todo';
import { getSession } from '@/repos/iron';

export const metadata: Metadata = {
  title: 'OnlyFeeds',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = await getSession();
  return (
    <html lang={preferredLanguages}>
      <body>
        <Providers>
          <PublicLayout user={user}>{children}</PublicLayout>
        </Providers>
      </body>
    </html>
  );
}
