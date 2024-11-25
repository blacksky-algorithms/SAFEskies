// app/layout.tsx
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { PublicLayout } from '@/components/layouts/public-layout';
import './globals.css';
import { AdminLayout } from '@/components/layouts/admin-layout';
import { ModalProvider } from '@/providers/modal-provider';

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
  userType,
}: Readonly<{
  children: React.ReactNode;
  userType: 'admin' | 'non-admin';
}>) {
  const Layout = userType === 'admin' ? AdminLayout : PublicLayout;

  return (
    <html
      lang='en'
      className='container mx-auto bg-black min-w-screen overscroll-auto'
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ModalProvider>
          <Layout>{children}</Layout>
        </ModalProvider>
      </body>
    </html>
  );
}
