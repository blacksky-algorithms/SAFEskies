import React from 'react';
import { User } from '@/lib/types/user';
import { SideDrawerLink } from '../components/side-drawer-link';

interface AdminSideDrawerContentProps {
  user: User | null;
  handleLinkClick: (path: string) => void;
}

export const AdminSideDrawerContent = ({
  user,
  handleLinkClick,
}: AdminSideDrawerContentProps) => {
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
        <SideDrawerLink
          label='Logs'
          href='/admin/logs'
          onClick={handleLinkClick}
        />
      </ul>
    </nav>
  );
};
