import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { PublicLayout } from '@/components/layouts/public-layout';
import './globals.css';

import { Providers } from '@/providers';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Feed Moderator',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
  userType: 'admin' | 'non-admin';
}>) {
  return (
    <html
      lang='en'
      className='container mx-auto bg-black min-w-screen overscroll-auto text-white'
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <PublicLayout>{children}</PublicLayout>
        </Providers>
      </body>
    </html>
  );
}
