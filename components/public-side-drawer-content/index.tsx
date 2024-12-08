'use client';

import { MODAL_INSTANCE_IDS } from '@/enums/modals';
import { useModal } from '@/contexts/modal-context';
import Link from 'next/link';
import React from 'react';
import { useUser } from '@/hooks/useUser';
import { Login } from '@/components/login';

export const PublicSideDrawerContent: React.FC = () => {
  const { closeModalInstance } = useModal();
  const { user } = useUser();
  if (!user) {
    return <Login />;
  }
  return (
    <div className='p-4 h-full'>
      <ul className='space-y-2'>
        <li>
          <Link
            href='/'
            onClick={() => closeModalInstance(MODAL_INSTANCE_IDS.SIDE_DRAWER)}
          >
            View Feed
          </Link>
        </li>
      </ul>
    </div>
  );
};
