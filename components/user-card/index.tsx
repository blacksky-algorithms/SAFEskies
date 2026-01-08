'use client';

import React from 'react';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import { OptimizedImage } from '@/components/optimized-image';

interface UserLike {
  did: string;
  handle?: string;
  displayName?: string;
  avatar?: string | null;
}

interface UserCardProps {
  user: ProfileViewBasic | UserLike;
  onClick?: (user: ProfileViewBasic | UserLike) => void;
  actionText?: string;
  badge?: {
    text: string;
    className: string;
  };
  showDid?: boolean;
}

export const UserCard = ({
  user,
  onClick,
  actionText = "Click to manage",
  badge,
  showDid = true
}: UserCardProps) => {
  return (
    <div
      className='flex items-center space-x-4 p-4 border border-app-border rounded-lg hover:bg-app-secondary-hover cursor-pointer transition-colors'
      onClick={() => onClick?.(user)}
    >
      {user.avatar ? (
        <OptimizedImage
          src={user.avatar}
          alt={`Avatar of ${user.handle}`}
          className='w-12 h-12 rounded-full'
        />
      ) : (
        <div className='w-12 h-12 bg-app-secondary rounded-full flex items-center justify-center'>
          <span className='text-app-secondary text-lg font-semibold'>
            {(user.displayName || user.handle || user.did).charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      <div className='flex-1'>
        <div className='font-medium text-app'>
          {user.displayName || user.handle || 'Unknown User'}
        </div>
        {user.handle ? (
          <div className='text-sm text-app-secondary'>
            @{user.handle}
          </div>
        ) : (
          <div className='text-sm text-app-secondary italic'>
            Handle not available
          </div>
        )}
        {showDid && (
          <div className='text-xs text-app-secondary'>
            DID: {user.did}
          </div>
        )}
      </div>
      <div className='flex items-center space-x-2'>
        {badge && (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.className}`}>
            {badge.text}
          </span>
        )}
        <div className='text-sm text-app-secondary'>
          {actionText}
        </div>
      </div>
    </div>
  );
};