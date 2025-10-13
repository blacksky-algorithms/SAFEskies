import React, { useMemo } from 'react';
import { User } from '@/lib/types/user';
import { SideDrawerLink } from '../components/side-drawer-link';
import { getLinksByFeed, hasBlackskyPermission } from '@/lib/utils/getLinks';

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
      <div className='space-y-2'>
        <ul className='space-y-2'>
          {feedLinks.length > 0 ? (
            <SideDrawerLink
              label='Feeds'
              onClick={handleLinkClick}
              nestedLinks={feedLinks}
            />
          ) : null}
          <SideDrawerLink
            label='Moderators'
            nestedLinks={[
              { label: 'Promote User', href: '/admin/mods/promote' },
              { label: 'Manage Moderators', href: '/admin/mods/manage' },
            ]}
            onClick={handleLinkClick}
          />
          
          {hasBlackskyPermission(user) ? (
            <SideDrawerLink
              label='Users'
              href='/users'
              onClick={handleLinkClick}
            />
          ) : null}
          {logsLinks.length > 0 ? (
            <SideDrawerLink
              label='Logs'
              onClick={handleLinkClick}
              nestedLinks={logsLinks}
            />
          ) : null}
        </ul>
      </div>
    </nav>
  );
};
