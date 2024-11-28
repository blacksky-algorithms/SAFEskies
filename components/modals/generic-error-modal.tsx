import { Modal } from '@/components/modals';
import { MODAL_INSTANCE_IDS } from '@/enums/modals';

export const GenericErrorModal = () => {
  return (
    <Modal id={MODAL_INSTANCE_IDS.GENERIC_ERROR} title='Oh no!' size='medium'>
      <p>Something went wrong!</p>
    </Modal>
  );
};
