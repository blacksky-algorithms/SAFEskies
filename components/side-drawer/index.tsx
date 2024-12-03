import { PublicSideDrawerContent } from '@/components/public-side-drawer-content';
import { Modal } from '@/components/modals';
import { MODAL_INSTANCE_IDS } from '@/enums/modals';

export const SideDrawer = () => {
  return (
    <Modal
      id={MODAL_INSTANCE_IDS.SIDE_DRAWER}
      title='Panel Content'
      size='full'
    >
      <PublicSideDrawerContent />
    </Modal>
  );
};
