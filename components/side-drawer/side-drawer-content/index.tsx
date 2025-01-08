'use client';

import React from 'react';
import { User } from '@/lib/types/user';
import { UserDrawerContent } from './user-drawer-content';
import { ModSideDrawerContent } from './mod-side-drawer-content';
import { AdminSideDrawerContent } from './admin-side-drawer-content';
import { useModal } from '@/contexts/modal-context';
import { MODAL_INSTANCE_IDS } from '@/enums/modals';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/lib/types/permission';

interface Props {
  user: User | null;
  highestRole: UserRole | null;
}

export const SideDrawerContent = ({ user, highestRole }: Props) => {
  const router = useRouter();
  const { closeModalInstance } = useModal();

  if (!user || !user.rolesByFeed) {
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

  if (!highestRole) {
    return null;
  }

  return (
    <div className='flex flex-col h-full gap-4 p-4'>
      {SIDE_DRAWER_CONTENT[highestRole]}
    </div>
  );
};
