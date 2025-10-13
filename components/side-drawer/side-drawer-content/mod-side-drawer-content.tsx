import React, { useMemo } from 'react';
import { User } from '@/lib/types/user';
import { SideDrawerLink } from '../components/side-drawer-link';
import { getLinksByFeed, hasBlackskyPermission } from '@/lib/utils/getLinks';

interface ModSideDrawerContentProps {
  user: User | null;
  handleLinkClick: (path: string) => void;
}

export const ModSideDrawerContent = ({
  user,
  handleLinkClick,
}: ModSideDrawerContentProps) => {
  const logsByFeedLinks = useMemo(() => getLinksByFeed(user, 'logs'), [user]);
  const feedLinks = useMemo(() => getLinksByFeed(user, 'feed'), [user]);
  if (!user) return null;

  return (
    <nav className='p-4 space-y-4'>
      <div className='space-y-2'>
        <ul className='space-y-1'>
          <SideDrawerLink label='Home' href='/' onClick={handleLinkClick} />
          {feedLinks.length > 0 ? (
            <SideDrawerLink
              label='Feeds'
              onClick={handleLinkClick}
              nestedLinks={feedLinks}
            />
          ) : null}
          {hasBlackskyPermission(user) ? (
            <SideDrawerLink
              label='Users'
              href='/users'
              onClick={handleLinkClick}
            />
          ) : null}
          {logsByFeedLinks.length > 0 ? (
            <SideDrawerLink
              label='Logs'
              onClick={handleLinkClick}
              nestedLinks={logsByFeedLinks}
            />
          ) : null}
        </ul>
      </div>
    </nav>
  );
};
