'use client';

import { MODAL_INSTANCE_IDS } from '@/enums/modals';
import { useModal } from '@/contexts/modal-context';
import Link from 'next/link';
import React from 'react';
import { LogoutButton } from '@/components/button/logout-button';
import { User } from '@/types/user';

interface Props {
  user: User | null;
}

export const PublicSideDrawerContent = ({ user }: Props) => {
  const { closeModalInstance } = useModal();
  return (
    <nav className='p-4 h-full flex flex-col'>
      <ul className='space-y-2 flex-grow'>
        <li>
          <Link
            href='/'
            onClick={() => closeModalInstance(MODAL_INSTANCE_IDS.SIDE_DRAWER)}
          >
            Home
          </Link>
        </li>

        {user ? (
          <li>
            <Link
              href='/mod'
              onClick={() => closeModalInstance(MODAL_INSTANCE_IDS.SIDE_DRAWER)}
            >
              Moderation
            </Link>
          </li>
        ) : null}
      </ul>

      <div className='mt-auto'>{user ? <LogoutButton /> : null}</div>
    </nav>
  );
};
