import React from 'react';
import cc from 'classcat';
import { VisualIntent, SharedSize } from '@/enums/styles';

interface LoadingSpinnerProps {
  size?: keyof typeof SharedSize;
  intent?: VisualIntent;
  'aria-label'?: string;
}

export const LoadingSpinner = ({
  size = 'md',
  intent = VisualIntent.Primary,
  'aria-label': ariaLabel = 'Loading...',
}: LoadingSpinnerProps) => {
  const sizeClass = SharedSize[size];

  return (
    <div
      className={cc([
        'flex items-center justify-center',
        sizeClass,
        {
          'text-app-primary': intent === VisualIntent.Primary,
          'text-app-secondary': intent === VisualIntent.Secondary,
          'text-app-error': intent === VisualIntent.Error,
          'text-app-info': intent === VisualIntent.Info,
          'text-app-success': intent === VisualIntent.Success,
        },
      ])}
      role='status' // Announces the loading state
      aria-live='polite' // Screen readers announce politely
      aria-label={ariaLabel} // Ensures screen readers announce the name
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
