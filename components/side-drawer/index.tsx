import { SideDrawerContent } from '@/components/side-drawer/side-drawer-content';
import { Modal } from '@/components/modals';
import { MODAL_INSTANCE_IDS } from '@/enums/modals';
import { User } from '@/types/user';
import { LogoutButton } from '../button/logout-button';

interface Props {
  user: User | null;
}

export const SideDrawer = ({ user }: Props) => {
  return (
    <Modal
      id={MODAL_INSTANCE_IDS.SIDE_DRAWER}
      title='Panel Content'
      size='full'
    >
      <div className='flex justify-between flex-col h-full'>
        <SideDrawerContent user={user} />
        <div className='mt-auto border-t border-app-border pt-4'>
          <LogoutButton />
        </div>
      </div>
    </Modal>
  );
};
