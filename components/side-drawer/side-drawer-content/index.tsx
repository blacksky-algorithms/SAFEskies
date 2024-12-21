'use client';

import React from 'react';
import { LogoutButton } from '@/components/button/logout-button';
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
  if (!user) {
    return null;
  }

  const handleLinkClick =
    (href: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      closeModalInstance(MODAL_INSTANCE_IDS.SIDE_DRAWER);
      router.push(href);
    };
  const SIDE_DRAWER_CONTENT = {
    admin: (
      <AdminSideDrawerContent user={user} handleLinkClick={handleLinkClick} />
    ),
    mod: <ModSideDrawerContent user={user} handleLinkClick={handleLinkClick} />,
    user: <UserDrawerContent user={user} />,
  };

  return (
    <div className='flex flex-col h-full gap-4 p-4'>
      <div className='flex-1 overflow-y-auto'>
        {SIDE_DRAWER_CONTENT[user.role || 'user']}
      </div>
      <div className='mt-auto border-t border-app-border pt-4'>
        <LogoutButton />
      </div>
    </div>
  );
};
