'use client';

import React from 'react';
import { useModal } from '@/providers/modal-provider';
import { MODAL_INSTANCE_IDS } from '@/enums/modals';

export const UserButton = () => {
  const { openModalInstance } = useModal();
  const toggleModal = () => openModalInstance(MODAL_INSTANCE_IDS.SIDE_DRAWER);
  return (
    <button
      className='flex items-center space-x-2 text-white hover:text-blue-500 transition'
      onClick={toggleModal}
      aria-label='Open user menu'
    >
      <div className='w-8 h-8 bg-gray-700 rounded-full'></div>
      {/* Placeholder avatar */}
      <span className='hidden sm:block text-sm font-medium'>User</span>
    </button>
  );
};
