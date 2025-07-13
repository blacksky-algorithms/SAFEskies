'use client';

import { PropsWithChildren } from 'react';
import { UserButton } from '@/components/user-button';
import { LoginButton } from '@/components/button/login-button';
import { IconButton } from '@/components/button/icon-button';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { User } from '@/lib/types/user';
import { useModal } from '@/contexts/modal-context';
import { MODAL_INSTANCE_IDS } from '@/enums/modals';

export const Header = ({
  children,
  user,
}: PropsWithChildren<{ user: User | null }>) => {
  const pathname = usePathname();
  const { openModalInstance } = useModal();
  const isAuthScreen = pathname === '/oauth/login';

  const handleSearchClick = () => {
    openModalInstance(MODAL_INSTANCE_IDS.SEARCH);
  };

  if (isAuthScreen) {
    return (
      <header className='w-full px-4 py-3 flex items-center justify-between'>
        <h1 className='text-lg font-bold'>
          <Link href='/'>SAFEskies</Link>
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
        <Link href='/'>SAFEskies</Link>
        <p className='hidden desktop:block text-sm'>
          Software Against A Fearful Environment
        </p>
      </h1>
      {children}
      <div className='flex items-center  space-x-4'>
        {/* Search button for tablet and smaller screens */}

        <div className='flex items-center jusify-center size-8'>
          <IconButton
            icon='MagnifyingGlassIcon'
            onClick={handleSearchClick}
            className='desktop:hidden'
            title='Search'
            size='sm'
            noPadding
          />
        </div>
        {!user ? <LoginButton /> : <UserButton user={user} />}
      </div>
    </header>
  );
};
