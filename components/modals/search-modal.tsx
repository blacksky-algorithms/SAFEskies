'use client';

import { Modal } from '@/components/modals';
import { MODAL_INSTANCE_IDS } from '@/enums/modals';

import { SearchPanel } from '../search-panel';

interface SearchModalProps {
  onClose?: () => void;
}

export const SearchModal = ({ onClose }: SearchModalProps) => {
  return (
    <Modal
      id={MODAL_INSTANCE_IDS.SEARCH}
      title='Search'
      onClose={onClose}
      fullWidthMobile
      size='full'
    >
      <SearchPanel isModal />
    </Modal>
  );
};
