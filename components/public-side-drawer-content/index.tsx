'use client';

import { MODAL_INSTANCE_IDS } from '@/enums/modals';
import { useModal } from '@/contexts/modal-context';
import Link from 'next/link';
import React from 'react';
import { useUser } from '@/hooks/useUser';
import { LogoutButton } from '@/components/button/logout-button';

export const PublicSideDrawerContent: React.FC = () => {
  const { closeModalInstance } = useModal();
  const { user } = useUser();
  return (
    <nav className='p-4 h-full flex flex-col'>
      {user ? (
        <ul className='space-y-2 flex-grow'>
          <li>
            <Link
              href='/'
              onClick={() => closeModalInstance(MODAL_INSTANCE_IDS.SIDE_DRAWER)}
            >
              View Feed
            </Link>
          </li>
        </ul>
      ) : null}
      <div className='mt-auto'>{user ? <LogoutButton /> : null}</div>
    </nav>
  );
};
