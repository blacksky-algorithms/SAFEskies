'use client';

import React from 'react';
import { useModal } from '@/contexts/modal-context';
import { MODAL_INSTANCE_IDS } from '@/enums/modals';
import { Button } from '@/components/button';
import { OptimizedImage } from '../optimized-image';
import cc from 'classcat';
import { User } from '@/types/user';
import { VisualIntent } from '@/enums/styles';

export const UserButton = ({ user }: { user: User }) => {
  const { openModalInstance } = useModal();
  const toggleModal = () => openModalInstance(MODAL_INSTANCE_IDS.SIDE_DRAWER);

  return (
    <Button
      intent={VisualIntent.TextButton}
      className='flex items-center space-x-2'
      onClick={toggleModal}
      aria-label='Open user menu'
    >
      {user?.avatar ? (
        <OptimizedImage
          src={user.avatar}
          alt={`Avatar of ${user?.name}`}
          className={cc([
            'w-8 h-8 rounded-full mr-2',
            // { 'blur-[1.5px]': user?.labels?.length > 0 }, // TODO
          ])}
        />
      ) : (
        <>
          {/* Placeholder avatar */}
          <div className='w-8 h-8 bg-gray-700 rounded-full'></div>
        </>
      )}
      <span className='hidden sm:block text-sm font-medium'>
        {user?.name || 'User'}
      </span>
    </Button>
  );
};
