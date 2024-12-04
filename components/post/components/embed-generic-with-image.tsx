/* eslint-disable @next/next/no-img-element */
import { Button } from '@/components/button';
import { NotImplementedModal } from '@/components/modals/not-implemented-modal';
import { useModal } from '@/contexts/modal-context';
import { MODAL_INSTANCE_IDS } from '@/enums/modals';
import Link from 'next/link';
import { useState } from 'react';

export const GenericWithImageEmbed = ({
  title,
  subtitle,
  href,
  image,
  description,
}: {
  title: string;
  subtitle: string;
  href: string;
  image?: string;
  description?: string;
}) => {
  const { openModalInstance, closeModalInstance } = useModal();
  const [confirmedHref, setConfirmedHref] = useState<string | null>(null);
  const onCloseModal = () => {
    if (confirmedHref) {
      window.location.href = href;
      closeModalInstance(MODAL_INSTANCE_IDS.NOT_IMPLEMENTED);
    }

    closeModalInstance(MODAL_INSTANCE_IDS.NOT_IMPLEMENTED);
  };
  // renders a link to a feed or list
  return (
    <>
      <Link
        onClick={() => openModalInstance(MODAL_INSTANCE_IDS.NOT_IMPLEMENTED)}
        className='w-full rounded-lg border py-2 px-3 flex flex-col gap-2'
        href={confirmedHref ? href : '#'}
      >
        <div className='flex gap-2.5 items-center'>
          {image ? (
            <img
              src={image}
              alt={title}
              className='w-8 h-8 rounded-lg  shrink-0'
            />
          ) : (
            <div className='w-8 h-8 rounded-lg bg-brand shrink-0' />
          )}
          <div className='flex-1'>
            <p className='font-bold text-sm'>{title}</p>
            <p className='text-textLight text-sm'>{subtitle}</p>
          </div>
        </div>
        {description && <p className='text-textLight text-sm'>{description}</p>}
      </Link>
      <NotImplementedModal>
        <p className='text-center'>
          This feature has not yet been implemented on OnlyFeeds, if you
          confirmedHref you will be going to the Blue Sky App
        </p>
        <div>
          <Button onClick={() => setConfirmedHref(href)}>Proceed</Button>
          <Button onClick={onCloseModal}>Cancel</Button>
        </div>
      </NotImplementedModal>
    </>
  );
};
