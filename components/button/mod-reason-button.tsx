'use client';

import React from 'react';
import { Icon } from '@/components/icon';
import { ReportOption } from '@/lib/types/moderation';

interface ModMenuProps {
  isViewOnly?: boolean;
  reason: ReportOption | null;
  handleSelectReportReason?: (reason: ReportOption) => void;
}

export const ModReasonButton = ({
  isViewOnly = false,
  reason,
  handleSelectReportReason,
}: ModMenuProps) => {
  if (!reason) return null;
  const { title, description } = reason;

  return (
    <button
      onClick={() => handleSelectReportReason?.(reason)}
      className='flex items-center justify-between p-4 border border-app-border gap-4 rounded-lg w-full hover:bg-app-secondary-hover transition-colors text-left group'
      disabled={isViewOnly}
    >
      <div>
        <h3 className='font-medium text-app'>{title}</h3>
        <p className='text-sm text-app-secondary'>{description}</p>
      </div>
      <Icon
        icon={isViewOnly ? 'CheckIcon' : 'ChevronRightIcon'}
        className='h-5 w-5 text-app-secondary group-hover:text-app transition-colors'
      />
    </button>
  );
};
