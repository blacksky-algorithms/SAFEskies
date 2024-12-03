'use client';

import { Modal } from '@/components/modals';
import { MODAL_INSTANCE_IDS } from '@/enums/modals';

interface GenericErrorModalProps {
  onClose?: () => void;
  children?: React.ReactNode;
}

export const GenericErrorModal = ({
  onClose,
  children,
}: GenericErrorModalProps) => {
  return (
    <Modal
      id={MODAL_INSTANCE_IDS.GENERIC_ERROR}
      title='Oh no!'
      size='medium'
      onClose={onClose}
      className='flex flex-col items-center gap-y-4'
    >
      <p className='text-center'>Something went wrong!</p>
      {children}
    </Modal>
  );
};
