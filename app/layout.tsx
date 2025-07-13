import '@/styles/globals.css';

import { Providers } from '@/contexts';
import { preferredLanguages } from '@/lib/constants';
import { BaseLayout } from '@/components/layouts/base-layout';
import { SideDrawerContent } from '@/components/side-drawer/side-drawer-content';
import { ConditionalSearchPanel } from '@/components/conditional-search-panel';
import { getProfile } from '@/repos/profile';

import type { Metadata, Viewport } from 'next';
import { getHighestRoleForUser } from '@/lib/utils/permission';

export const dynamic = 'force-dynamic';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'SAFEskies',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getProfile();

  const highestRole = await getHighestRoleForUser(user?.rolesByFeed);

  return (
    <html lang={preferredLanguages}>
      <body>
        <Providers>
          <BaseLayout
            user={user}
            highestRole={highestRole}
            sideContent={
              <SideDrawerContent user={user} highestRole={highestRole} />
            }
            rightContent={<ConditionalSearchPanel user={user} />}
          >
            {children}
          </BaseLayout>
        </Providers>
      </body>
    </html>
  );
}
