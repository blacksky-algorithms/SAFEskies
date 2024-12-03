'use client';

import { Modal } from '@/components/modals';
import { MODAL_INSTANCE_IDS } from '@/enums/modals';

interface NotImplementedModalProps {
  onClose?: () => void;
  children?: React.ReactNode;
}

export const NotImplementedModal = ({
  onClose,
  children,
}: NotImplementedModalProps) => {
  return (
    <Modal
      id={MODAL_INSTANCE_IDS.NOT_IMPLEMENTED}
      title='Please be patient'
      size='medium'
      onClose={onClose}
      className='flex flex-col items-center gap-y-4'
    >
      {children}
    </Modal>
  );
};
