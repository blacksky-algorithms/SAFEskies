'use client';

import { MODAL_INSTANCE_IDS } from '@/enums/modals';
import { useModal } from '@/contexts/modal-context';
import Link from 'next/link';
import React from 'react';

export const PublicSideDrawerContent: React.FC = () => {
  const { closeModalInstance } = useModal();
  return (
    <div className='p-4 h-full'>
      <ul className='space-y-2'>
        <li>
          <Link
            href='/'
            onClick={() => closeModalInstance(MODAL_INSTANCE_IDS.SIDE_DRAWER)}
            className='text-blue-500 hover:underline'
          >
            View Feed
          </Link>
        </li>
      </ul>
    </div>
  );
};
