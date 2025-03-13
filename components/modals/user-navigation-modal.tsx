import { SideDrawerContent } from '@/components/side-drawer/side-drawer-content';
import { Modal } from '@/components/modals';
import { MODAL_INSTANCE_IDS } from '@/enums/modals';
import { User } from '@/lib/types/user';
import { LogoutButton } from '../button/logout-button';
import { UserRole } from '@/lib/types/permission';

interface Props {
  user: User | null;
  highestRole: UserRole | null;
}

export const UserNavigationModal = ({ user, highestRole }: Props) => {
  return (
    <Modal
      id={MODAL_INSTANCE_IDS.SIDE_DRAWER}
      title={
        <span className='flex items-center space-x-4'>
          {user?.displayName || user?.handle || 'Hey there!'}
        </span>
      }
      size='full'
      footer={
        <div className='mt-auto border-t border-app-border pt-4'>
          <LogoutButton />
        </div>
      }
    >
      <SideDrawerContent user={user} highestRole={highestRole} />
    </Modal>
  );
};
