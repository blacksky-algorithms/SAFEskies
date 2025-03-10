'use client';

import React, { useEffect } from 'react';
import { VisualIntent } from '@/enums/styles';
import { Modal } from '@/components/modals';
import { MODAL_INSTANCE_IDS } from '@/enums/modals';
import { IconButton } from '../button/icon-button';
import { ModReasonButton } from '../button/mod-reason-button';
import { ReportOption } from '@/lib/types/moderation';
import { useModal } from '@/contexts/modal-context';
import { fetchReportOptions } from '@/repos/moderation';
import { useProfileData } from '@/hooks/useProfileData';

interface ModMenuProps {
  onClose: () => void;
  handleSelectReportReason?: (reason: ReportOption) => void;
}

export const ModMenuModal = ({
  onClose,
  handleSelectReportReason,
}: ModMenuProps) => {
  const { isOpen } = useModal();
  const [state, setState] = React.useState<{
    isLoading: boolean;
    options: ReportOption[];
  }>({ isLoading: true, options: [] });

  const { profile } = useProfileData();

  useEffect(() => {
    const setOptionsToState = async () => {
      if (state?.options?.length === 0) {
        const response = await fetchReportOptions();

        setState((prev) => ({
          ...prev,
          options: response.options,
          isLoading: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
        }));
      }
    };
    setOptionsToState();
  }, [state?.options?.length]);

  if (!profile?.did) {
    return null;
  }

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
          {state.options.map((option) => (
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
