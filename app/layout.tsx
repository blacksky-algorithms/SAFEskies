import type { Metadata } from 'next';
import '@/styles/globals.css';

import { Providers } from '@/contexts';
import { preferredLanguages } from '@/utils/todo';
import { getSession } from '@/repos/iron';
import { BaseLayout } from '@/components/layouts/base-layout';
import { SideDrawerContent } from '@/components/side-drawer/side-drawer-content';

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
          <BaseLayout
            user={user}
            sideContent={<SideDrawerContent user={user} />}
          >
            {children}
          </BaseLayout>
        </Providers>
      </body>
    </html>
  );
}
