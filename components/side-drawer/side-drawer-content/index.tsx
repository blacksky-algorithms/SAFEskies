'use client';

import React, { useEffect } from 'react';
import { User, UserRole } from '@/types/user';
import { UserDrawerContent } from './user-drawer-content';
import { ModSideDrawerContent } from './mod-side-drawer-content';
import { AdminSideDrawerContent } from './admin-side-drawer-content';
import { useModal } from '@/contexts/modal-context';
import { MODAL_INSTANCE_IDS } from '@/enums/modals';
import { useRouter } from 'next/navigation';
import { FeedPermissionManager } from '@/services/feed-permissions-manager';

interface Props {
  user: User | null;
}

export const SideDrawerContent = ({ user }: Props) => {
  const router = useRouter();
  const { closeModalInstance } = useModal();
  const [highestRole, setHighestRole] = React.useState<UserRole | null>(null);

  useEffect(() => {
    const getHighestRole = async () => {
      if (user) {
        const data = await FeedPermissionManager.getHighestRoleForUser(
          user.did
        );

        setHighestRole(data);
      } else {
        setHighestRole('user');
      }
    };

    getHighestRole();
  }, [user]);

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
