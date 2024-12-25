import React from 'react';
import { User } from '@/types/user';
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
    <nav className='p-4 space-y-4'>
      <div className='space-y-2'>
        <SideDrawerLink
          label='Moderators'
          nestedLinks={[
            { label: 'Add Moderator', href: '/admin/mods/add' },
            { label: 'Manage Moderators', href: '/admin/mods/manage' },
          ]}
          onClick={handleLinkClick}
        />
      </div>

      {/* <div className='space-y-2'>
        <SideDrawerLink
          label='View Reports'
          href='/admin/reports'
          onClick={handleLinkClick}
        />
        <SideDrawerLink
          label='Audit Log'
          href='/admin/audit-log'
          onClick={handleLinkClick}
        />
      </div> */}
    </nav>
  );
};
