import React from 'react';
import cc from 'classcat';
import { Variant } from '@/enums/styles';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: Variant;
}

export const LoadingSpinner = ({
  size = 'md',
  variant = Variant.Primary,
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const colorClasses = {
    [Variant.Primary]: 'text-app-primary',
    [Variant.Secondary]: 'text-app-secondary',
    [Variant.Error]: 'text-app-error',
    [Variant.Info]: 'text-app-info',
    [Variant.Success]: 'text-app-success',
    [Variant.TextButton]: 'text-app-text',
  };

  return (
    <div
      className={cc([
        'flex items-center justify-center',
        sizeClasses[size],
        colorClasses[variant],
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
