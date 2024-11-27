import type { Metadata } from 'next';
import { PublicLayout } from '@/components/layouts/public-layout';
import './globals.css';

import { Providers } from '@/providers';

export const metadata: Metadata = {
  title: 'Feed Moderator',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  /*TODO: FONTS*/
  return (
    <html
      lang='en'
      className='container mx-auto bg-black min-w-screen overscroll-auto text-white'
    >
      <body>
        <Providers>
          <PublicLayout>{children}</PublicLayout>
        </Providers>
      </body>
    </html>
  );
}
