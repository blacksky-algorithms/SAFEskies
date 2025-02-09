import React, { useMemo } from 'react';
import { User } from '@/lib/types/user';
import { SideDrawerLink } from '../components/side-drawer-link';
import { getLinksByFeed } from '@/lib/utils/logs';

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
        <h2 className='text-app-secondary font-semibold px-4'>
          Hi {(user.name as string) || user.handle}
        </h2>
        <ul className='space-y-1'>
          <SideDrawerLink label='Home' href='/' onClick={handleLinkClick} />
          {feedLinks.length > 0 ? (
            <SideDrawerLink
              label='Feeds'
              onClick={handleLinkClick}
              nestedLinks={feedLinks}
              permission='mod'
            />
          ) : null}
          {logsByFeedLinks.length > 0 ? (
            <SideDrawerLink
              label='Logs'
              onClick={handleLinkClick}
              nestedLinks={logsByFeedLinks}
              permission='mod'
            />
          ) : null}
        </ul>
      </div>
    </nav>
  );
};
