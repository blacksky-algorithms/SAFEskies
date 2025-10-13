'use client';

import React, { useState } from 'react';
import { BSUserSearch } from '@/components/bs-user-search/bs-user-search';
import { useModal } from '@/contexts/modal-context';
import { MODAL_INSTANCE_IDS } from '@/enums/modals';
import { OptimizedImage } from '@/components/optimized-image';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import { UserModerationModal } from '@/components/modals/user-moderation-modal';

interface UserManagementPanelProps {
  feed: {
    uri: string;
    displayName: string;
  };
}

export const UserManagementPanel = ({
  feed
}: UserManagementPanelProps) => {
  const [selectedUser, setSelectedUser] = useState<ProfileViewBasic | null>(null);
  const { openModalInstance, closeModalInstance } = useModal();

  const handleUserSelect = (user: ProfileViewBasic) => {
    setSelectedUser(user);
    openModalInstance(MODAL_INSTANCE_IDS.USER_MODERATION);
  };

  const handleCloseModal = () => {
    closeModalInstance(MODAL_INSTANCE_IDS.USER_MODERATION);
  };

  return (
    <div className='w-full max-w-4xl space-y-6'>
      {/* Search Section */}
      <div className='bg-app-background border border-app-border rounded-lg p-6'>
        <h3 className='text-lg font-semibold text-app mb-4'>
          Search Users - {feed.displayName}
        </h3>
        <BSUserSearch
          onSelect={handleUserSelect}
          id='user-management-search'
          label='Search for users to moderate'
          placeholder='Search by handle or DID...'
        />
      </div>

      {/* Selected User Display */}
      {selectedUser && (
        <div className='bg-app-background border border-app-border rounded-lg p-6'>
          <h3 className='text-lg font-semibold text-app mb-4'>Selected User</h3>
          <div
            className='flex items-center space-x-4 p-4 border border-app-border rounded-lg hover:bg-app-secondary-hover cursor-pointer transition-colors'
            onClick={() => handleUserSelect(selectedUser)}
          >
            {selectedUser.avatar ? (
              <OptimizedImage
                src={selectedUser.avatar}
                alt={`Avatar of ${selectedUser.handle}`}
                className='w-12 h-12 rounded-full'
              />
            ) : (
              <div className='w-12 h-12 bg-app-secondary rounded-full flex items-center justify-center'>
                <span className='text-app-secondary text-lg font-semibold'>
                  {(selectedUser.displayName || selectedUser.handle).charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className='flex-1'>
              <div className='font-medium text-app'>
                {selectedUser.displayName || selectedUser.handle}
              </div>
              <div className='text-sm text-app-secondary'>
                @{selectedUser.handle}
              </div>
              <div className='text-xs text-app-secondary'>
                DID: {selectedUser.did}
              </div>
            </div>
            <div className='text-sm text-app-secondary'>
              Click to manage
            </div>
          </div>
        </div>
      )}

      {/* User Moderation Modal */}
      <UserModerationModal
        user={selectedUser}
        onClose={handleCloseModal}
      />
    </div>
  );
};