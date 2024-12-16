import { PublicSideDrawerContent } from '@/components/public-side-drawer-content';
import { Modal } from '@/components/modals';
import { MODAL_INSTANCE_IDS } from '@/enums/modals';
import { User } from '@/types/user';

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
      <PublicSideDrawerContent user={user} />
    </Modal>
  );
};
