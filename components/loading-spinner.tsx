import React from 'react';
import cc from 'classcat';
import { VisualIntent, SharedSize } from '@/enums/styles';

interface LoadingSpinnerProps {
  size?: keyof typeof SharedSize; // Use SharedSize enum keys
  variant?: VisualIntent;
}

export const LoadingSpinner = ({
  size = 'md',
  variant = VisualIntent.Primary,
}: LoadingSpinnerProps) => {
  const sizeClass = SharedSize[size];

  return (
    <div
      className={cc([
        'flex items-center justify-center',
        sizeClass,
        {
          'text-app-primary': variant === VisualIntent.Primary,
          'text-app-secondary': variant === VisualIntent.Secondary,
          'text-app-error': variant === VisualIntent.Error,
          'text-app-info': variant === VisualIntent.Info,
          'text-app-success': variant === VisualIntent.Success,
        },
      ])}
      role='status'
      aria-live='polite'
    >
      <svg
        className='animate-spin'
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 24 24'
        fill='none'
      >
        <circle
          className='opacity-25'
          cx='12'
          cy='12'
          r='10'
          stroke='currentColor'
          strokeWidth='4'
        ></circle>
        <path
          className='opacity-75'
          fill='currentColor'
          d='M4 12a8 8 0 018-8v8H4z'
        ></path>
      </svg>
    </div>
  );
};
