'use client';

import React from 'react';
import { VisualIntent } from '@/enums/styles';
import { Modal } from '@/components/modals';
import { MODAL_INSTANCE_IDS } from '@/enums/modals';
import { REPORT_OPTIONS } from '@/lib/constants/moderation';
import { IconButton } from '../button/icon-button';
import { ModReasonButton } from '../button/mod-reason-button';
import { ReportOption } from '@/lib/types/moderation';
import { useModal } from '@/contexts/modal-context';

interface ModMenuProps {
  onClose: () => void;
  handleSelectReportReason?: (reason: ReportOption) => void;
}

export const ModMenuModal = ({
  onClose,
  handleSelectReportReason,
}: ModMenuProps) => {
  const { isOpen } = useModal();
  return (
    <>
      <Modal
        id={MODAL_INSTANCE_IDS.MOD_MENU}
        title='Report this post'
        onClose={onClose}
        size='large'
        fullWidthMobile
        showBackButton={isOpen(MODAL_INSTANCE_IDS.HYDRATED_POST)}
      >
        <div className='flex flex-col overflow-y-auto space-y-4 '>
          {REPORT_OPTIONS.map((option) => (
            <ModReasonButton
              key={option.id}
              reason={option}
              handleSelectReportReason={handleSelectReportReason}
            />
          ))}

          <div className='p-4 bg-app-foreground mt-4 flex rounded-lg justify-between items-center flex-col tablet:flex-row'>
            <p className='text-app-inverted mb-2'>
              Need to report a copyright violation?
            </p>
            <div>
              <IconButton
                intent={VisualIntent.Primary}
                icon='ArrowTopRightOnSquareIcon'
                iconPosition='right'
                text='View details'
                onClick={() =>
                  window.open(
                    'https://bsky.social/about/support/copyright',
                    '_blank'
                  )
                }
              ></IconButton>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
