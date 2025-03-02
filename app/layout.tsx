import '@/styles/globals.css';

import { Providers } from '@/contexts';
import { preferredLanguages } from '@/lib/constants';
import { BaseLayout } from '@/components/layouts/base-layout';
import { SideDrawerContent } from '@/components/side-drawer/side-drawer-content';
import { getProfile } from '@/repos/profile';

import type { Viewport } from 'next';
import { getHighestRoleForUser } from '@/lib/utils/permission';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
          >
            {children}
          </BaseLayout>
        </Providers>
      </body>
    </html>
  );
}
