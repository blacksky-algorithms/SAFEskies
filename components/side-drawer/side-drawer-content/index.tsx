'use client';

import React, { useState } from 'react';
import { User } from '@/types/user';
import { UserDrawerContent } from './user-drawer-content';
import { ModSideDrawerContent } from './mod-side-drawer-content';
import { AdminSideDrawerContent } from './admin-side-drawer-content';
import { useModal } from '@/contexts/modal-context';
import { MODAL_INSTANCE_IDS } from '@/enums/modals';
import { useRouter } from 'next/navigation';

interface Props {
  user: User | null;
}

export const SideDrawerContent = ({ user }: Props) => {
  const router = useRouter();
  const { closeModalInstance } = useModal();

  // Map feeds to include displayName and role from the updated rolesByFeed structure
  const feeds = Object.values(user?.rolesByFeed || {});

  const [
    selectedFeedUri,
    // setSelectedFeedUri
  ] = useState<string | null>(feeds.length > 0 ? feeds[0].feedUri : null);
  if (!user || !user.rolesByFeed) {
    return null;
  }

  const handleLinkClick =
    (href: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      closeModalInstance(MODAL_INSTANCE_IDS.SIDE_DRAWER);
      router.push(href);
    };

  // const handleFeedSelection = (feedUri: string) => {
  //   setSelectedFeedUri(feedUri);
  // };

  const currentRole = selectedFeedUri
    ? feeds.find((feed) => feed.feedUri === selectedFeedUri)?.role || 'user'
    : 'user';

  const SIDE_DRAWER_CONTENT = {
    admin: (
      <AdminSideDrawerContent user={user} handleLinkClick={handleLinkClick} />
    ),
    mod: <ModSideDrawerContent user={user} handleLinkClick={handleLinkClick} />,
    user: <UserDrawerContent user={user} />,
  };

  return (
    <div className='flex flex-col h-full gap-4 p-4'>
      {/* <div className='mb-4'>
        <label htmlFor='feed-select'>Select Feed:</label>
        <select
          id='feed-select'
          className='w-full p-2 border border-gray-300 rounded'
          value={selectedFeedUri || ''}
          onChange={(e) => handleFeedSelection(e.target.value)}
        >
          {feeds.map((feed) => {
            return (
              <option key={feed.feedUri} value={feed.feedUri}>
                {feed.displayName}
              </option>
            );
          })}
        </select>
      </div> */}
      {SIDE_DRAWER_CONTENT[currentRole || 'user']}
    </div>
  );
};
