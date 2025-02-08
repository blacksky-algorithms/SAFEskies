import React, { useMemo } from 'react';
import { User } from '@/lib/types/user';
import { SideDrawerLink } from '../components/side-drawer-link';
import { getLogsByFeedLinks } from '@/lib/utils/logs';

interface AdminSideDrawerContentProps {
  user: User | null;
  handleLinkClick: (path: string) => void;
}

export const AdminSideDrawerContent = ({
  user,
  handleLinkClick,
}: AdminSideDrawerContentProps) => {
  const logsByFeedLinks = useMemo(() => getLogsByFeedLinks(user), [user]);

  if (!user) return null;

  return (
    <nav>
      <ul className='space-y-2'>
        <SideDrawerLink
          label='Moderators'
          nestedLinks={[
            { label: 'Promote User', href: '/admin/mods/promote' },
            { label: 'Manage Moderators', href: '/admin/mods/manage' },
          ]}
          onClick={handleLinkClick}
        />
        {logsByFeedLinks.length > 0 ? (
          <SideDrawerLink
            label='Logs'
            onClick={handleLinkClick}
            nestedLinks={logsByFeedLinks}
          />
        ) : null}
      </ul>
    </nav>
  );
};
