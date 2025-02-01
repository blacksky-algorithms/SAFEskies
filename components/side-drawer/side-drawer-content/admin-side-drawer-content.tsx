import React, { useMemo } from 'react';
import { User } from '@/lib/types/user';
import { SideDrawerLink } from '../components/side-drawer-link';
import { canPerformWithRole } from '@/lib/utils/permission';

interface AdminSideDrawerContentProps {
  user: User | null;
  handleLinkClick: (path: string) => void;
}

export const AdminSideDrawerContent = ({
  user,
  handleLinkClick,
}: AdminSideDrawerContentProps) => {
  const logsByFeedLinks = useMemo(() => {
    if (!user) return [];
    return Object.values(user.rolesByFeed).reduce(
      (
        acc: { label: string; href: string }[],
        { displayName, feedUri, role }
      ) => {
        if (canPerformWithRole(role, 'user_ban')) {
          acc.push({
            label: displayName,
            href: `/logs/feed/${encodeURIComponent(feedUri)}`,
          });
        }
        return acc;
      },
      []
    );
  }, [user?.rolesByFeed]);

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
            href='/admin/logs'
            onClick={handleLinkClick}
            nestedLinks={logsByFeedLinks}
          />
        ) : null}
      </ul>
    </nav>
  );
};
