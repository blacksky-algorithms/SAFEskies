import React from 'react';
import cc from 'classcat';
import { LoadingSpinner } from '@/components/loading-spinner';
import { VisualIntent } from '@/enums/styles';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: VisualIntent;
  children: React.ReactNode;
  noPadding?: boolean;
  submitting?: boolean;
}

export const Button = ({
  variant = VisualIntent.Primary,
  children,
  className,
  noPadding,
  disabled,
  submitting,
  ...props
}: ButtonProps) => {
  const isDisabled = disabled || submitting;

  return (
    <button
      className={cc([
        'font-medium rounded-md transition-all duration-150 focus:outline-none focus:ring-2 w-full',
        {
          'opacity-50 cursor-not-allowed': isDisabled,
          'bg-app-primary text-app-text hover:bg-app-primary-hover focus:ring-app-primary':
            variant === VisualIntent.Primary && !isDisabled,
          'bg-app-secondary text-app-text hover:bg-app-secondary-hover focus:ring-app-secondary':
            variant === VisualIntent.Secondary && !isDisabled,
          'bg-app-error text-app-text hover:bg-app-error-hover focus:ring-app-error':
            variant === VisualIntent.Error && !isDisabled,
          'bg-app-info text-app-text hover:bg-app-info-hover focus:ring-app-info':
            variant === VisualIntent.Info && !isDisabled,
          'bg-app-success text-app-text hover:bg-app-success-hover focus:ring-app-success':
            variant === VisualIntent.Success && !isDisabled,
          'text-app-text hover:text-app-text-hover focus:underline bg-transparent':
            variant === VisualIntent.TextButton && !isDisabled,
          'p-2': !noPadding,
        },
        className,
      ])}
      disabled={isDisabled}
      aria-busy={submitting || undefined}
      {...props}
    >
      {submitting ? (
        <span className='flex items-center justify-center'>
          <LoadingSpinner size='sm' variant={variant} />
          <span className='ml-2'>Loading...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};
