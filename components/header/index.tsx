'use client';

import { PropsWithChildren } from 'react';
import { UserButton } from '@/components/user-button';
import { LoginButton } from '@/components/button/login-button';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { User } from '@/lib/types/user';

export const Header = ({
  children,
  user,
}: PropsWithChildren<{ user: User | null }>) => {
  const pathname = usePathname();
  const isAuthScreen = pathname === '/oauth/login';

  if (isAuthScreen) {
    return (
      <header className='w-full px-4 py-3 flex items-center justify-between'>
        <h1 className='text-lg font-bold'>
          <Link href='/'>SAFEsky</Link>
        </h1>
        <p className='hidden tablet:block text-sm'>
          Software Against A Fearful Environment
        </p>
        {children}
      </header>
    );
  }

  return (
    <header className='w-full px-4 py-3 flex items-center justify-between'>
      <h1 className='text-lg font-bold'>
        <Link href='/'>SAFEsky</Link>
        <p className='hidden tablet:block text-sm'>
          Software Against A Fearful Environment
        </p>
      </h1>
      {children}
      <div className='flex items-center space-x-4'>
        {!user ? <LoginButton /> : <UserButton user={user} />}
      </div>
    </header>
  );
};
