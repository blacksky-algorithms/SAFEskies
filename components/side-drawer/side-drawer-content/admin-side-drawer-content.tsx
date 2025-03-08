import React, { useMemo } from 'react';
import { User } from '@/lib/types/user';
import { SideDrawerLink } from '../components/side-drawer-link';
import { getLinksByFeed } from '@/lib/utils/logs';

interface AdminSideDrawerContentProps {
  user: User | null;
  handleLinkClick: (path: string) => void;
}

export const AdminSideDrawerContent = ({
  user,
  handleLinkClick,
}: AdminSideDrawerContentProps) => {
  const logsLinks = useMemo(() => getLinksByFeed(user, 'logs'), [user]);
  const feedLinks = useMemo(() => getLinksByFeed(user, 'feed'), [user]);

  if (!user) return null;

  return (
    <nav>
      <ul className='space-y-2'>
        {feedLinks.length > 0 ? (
          <SideDrawerLink
            label='Feeds'
            onClick={handleLinkClick}
            nestedLinks={feedLinks}
            permission='admin'
          />
        ) : null}
        <SideDrawerLink
          label='Moderators'
          permission='admin'
          nestedLinks={[
            { label: 'Promote User', href: '/admin/mods/promote' },
            { label: 'Manage Moderators', href: '/admin/mods/manage' },
          ]}
          onClick={handleLinkClick}
        />
        {logsLinks.length > 0 ? (
          <SideDrawerLink
            label='Logs'
            onClick={handleLinkClick}
            nestedLinks={logsLinks}
            permission='admin'
          />
        ) : null}
      </ul>
    </nav>
  );
};
