import { PublicSideDrawerContent } from '@/components/public-side-drawer-content';
import { BaseModal } from '@/components/base-modal';
import { MODAL_INSTANCE_IDS } from '@/enums/modals';

export const SideDrawer = () => {
  return (
    <BaseModal
      id={MODAL_INSTANCE_IDS.SIDE_DRAWER}
      title='Panel Content'
      size='full'
    >
      <PublicSideDrawerContent />
    </BaseModal>
  );
};
