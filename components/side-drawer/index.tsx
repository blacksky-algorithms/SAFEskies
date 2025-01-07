import { SideDrawerContent } from '@/components/side-drawer/side-drawer-content';
import { Modal } from '@/components/modals';
import { MODAL_INSTANCE_IDS } from '@/enums/modals';
import { User } from '@/lib/types/user';
import { LogoutButton } from '../button/logout-button';
import cc from 'classcat';
import { UserRole } from '@/lib/types/permission';

interface Props {
  user: User | null;
  highestRole: UserRole | null;
}

export const SideDrawer = ({ user, highestRole }: Props) => {
  return (
    <Modal
      id={MODAL_INSTANCE_IDS.SIDE_DRAWER}
      title={
        <span className='flex items-center space-x-4'>
          <span>{user?.displayName || user?.handle || 'User'}</span>

          <span
            className={cc([
              '',
              {
                'bg-app-primary rounded-full px-2 py-1 text-xs':
                  !!highestRole && highestRole !== 'user',
                hidden: !highestRole || highestRole === 'user',
              },
            ])}
          >
            {highestRole}
          </span>
        </span>
      }
      size='full'
    >
      <div className='flex justify-between flex-col h-full'>
        <SideDrawerContent user={user} highestRole={highestRole} />
        <div className='mt-auto border-t border-app-border pt-4'>
          <LogoutButton />
        </div>
      </div>
    </Modal>
  );
};
