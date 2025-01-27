'use client';

import React from 'react';
import { Modal } from '@/components/modals';
import { MODAL_INSTANCE_IDS } from '@/enums/modals';
import {
  MODERATION_SERVICES,
  ModerationService,
} from '@/lib/constants/moderation';
import { ReportOption } from '@/lib/types/moderation';
import { ModReasonButton } from '@/components/button/mod-reason-button';
import { Checkbox } from '@/components/input/checkbox';
import { Textarea } from '@/components/input/text-area';
import { Button } from '@/components/button';
import { VisualIntent } from '@/enums/styles';
import cc from 'classcat';

interface Props {
  onClose: () => void;
  onReport: () => void;
  reason: ReportOption | null;
  isReportSubmitting: boolean;
  handleReportToChange: (reportTo: ModerationService) => void;
  isModServiceChecked: (service: ModerationService) => boolean;
  isDisabled: boolean;
}

export const ReportPostModal = ({
  onClose,
  onReport,
  reason,
  isReportSubmitting,
  handleReportToChange,
  isModServiceChecked,
  isDisabled,
}: Props) => {
  return (
    <Modal
      id={MODAL_INSTANCE_IDS.REPORT_POST}
      title='Report'
      onClose={onClose}
      size='large'
      fullWidthMobile
    >
      <ModReasonButton reason={reason} isViewOnly />
      <div className='flex flex-col space-y-4 pt-4'>
        <section>
          <p className='text-app-secondary pb-1'>
            Select the moderation service(s) to report to
          </p>
          <ul
            className={cc([
              'bg-app-secondary-hover rounded-xl p-4 flex flex-col space-y-2',
              {
                'bg-app-secondary-hover ring-offset-1 ring-4  ring-app-error':
                  isDisabled,
              },
            ])}
          >
            {isDisabled ? (
              <p className='text-app-error sr-only' role='alert'>
                You must select at least one moderation service
              </p>
            ) : null}
            {MODERATION_SERVICES.map((service) => {
              return (
                <li
                  key={service.value}
                  className='flex items-center justify-between p-2 border border-app-secondary rounded-lg'
                >
                  <Checkbox
                    id={service.value}
                    label={service.label}
                    checked={
                      isModServiceChecked(service as ModerationService) || false
                    }
                    onChange={() =>
                      handleReportToChange(service as ModerationService)
                    }
                  />
                </li>
              );
            })}
          </ul>
        </section>
        <Textarea
          id='additional report information'
          label='Optionally provide additional information below:'
          maxLength={300}
        />
        <Button
          onClick={onReport}
          intent={VisualIntent.Error}
          className='w-fit self-end'
          submitting={isReportSubmitting}
          disabled={isReportSubmitting || isDisabled}
        >
          Send report
        </Button>
      </div>
    </Modal>
  );
};
