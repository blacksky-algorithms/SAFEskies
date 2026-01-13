'use client';

import React, { useState } from 'react';
import { BSUserSearch } from '@/components/bs-user-search/bs-user-search';
import { useModal } from '@/contexts/modal-context';
import { MODAL_INSTANCE_IDS } from '@/enums/modals';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import { UserModerationModal } from '@/components/modals/user-moderation-modal';
import { EscalatedUsersList } from '@/components/escalated-users-list';
import { EscalatedItem } from '@/lib/types/moderation';

export const UserManagementPanel = () => {
  const [selectedUser, setSelectedUser] = useState<ProfileViewBasic | EscalatedItem | null>(null);
  const { openModalInstance, closeModalInstance } = useModal();

  const handleUserSelect = (user: ProfileViewBasic | EscalatedItem) => {
    setSelectedUser(user);
    openModalInstance(MODAL_INSTANCE_IDS.USER_MODERATION);
  };

  const handleCloseModal = () => {
    closeModalInstance(MODAL_INSTANCE_IDS.USER_MODERATION);
  };

  return (
    <div className='w-full max-w-4xl space-y-6'>
      {/* Search Section */}
      <div className='space-y-2'>
        <p className='text-app text-sm'>Search for users by handle or DID</p>
        <BSUserSearch
          onSelect={handleUserSelect}
          id='user-management-search'
          label=''
          placeholder='Search by handle or DID...'
        />
      </div>

      {/* Escalated Reports */}
      <EscalatedUsersList onUserSelect={handleUserSelect} />

      {/* User Moderation Modal */}
      <UserModerationModal
        user={selectedUser}
        onClose={handleCloseModal}
      />
    </div>
  );
};