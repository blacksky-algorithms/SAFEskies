'use client';

import { PropsWithChildren } from 'react';
import { UserButton } from '@/components/user-button';
import { useUser } from '@/hooks/useUser';
import { LoginButton } from '@/components/button/login-button';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export const Header = ({ children }: PropsWithChildren) => {
  const {
    user,
    loading,
    // error, // TODO: handle error
  } = useUser();

  const pathname = usePathname();
  const isAuthScreen = pathname === '/oauth/login';

  if (isAuthScreen) {
    return (
      <header className='w-full px-4 py-3 flex items-center justify-between'>
        <h1 className='text-lg font-bold'>
          <Link href='/'>OnlyFeeds</Link>
        </h1>
        {children}
      </header>
    );
  }

  return (
    <header className='w-full px-4 py-3 flex items-center justify-between'>
      <h1 className='text-lg font-bold'>OnlyFeeds</h1>
      {children}
      <div className='flex items-center space-x-4'>
        {!user && !loading ? <LoginButton /> : <UserButton />}
      </div>
    </header>
  );
};
