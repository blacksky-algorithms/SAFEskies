import React from 'react';
import cc from 'classcat';
import { VisualIntent } from '@/enums/styles';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: VisualIntent;
  inputSize?: 'sm' | 'md' | 'lg';
  label?: string;
  errorMessage?: string;
}

export const Input = ({
  variant = VisualIntent.Primary,
  inputSize = 'md',
  label,
  errorMessage,
  className,
  ...props
}: InputProps) => {
  const sizeClasses = {
    sm: 'p-2 text-sm',
    md: 'p-3 text-base',
    lg: 'p-4 text-lg',
  };

  return (
    <div className='flex flex-col space-y-2'>
      {label && <label className='font-medium text-app'>{label}</label>}
      <input
        className={cc([
          'font-medium rounded-md transition-all duration-150 focus:outline-none focus:ring-2',
          sizeClasses[inputSize],
          {
            'border border-app-border bg-app-background text-app focus:ring-app-primary':
              variant === VisualIntent.Primary,
            'border border-app-secondary bg-app-background text-app-secondary focus:ring-app-secondary':
              variant === VisualIntent.Secondary,
            'border border-app-error bg-app-error-light text-app-error focus:ring-app-error':
              variant === VisualIntent.Error,
            'border border-app-info bg-app-info-light text-app-info focus:ring-app-info':
              variant === VisualIntent.Info,
            'border border-app-success bg-app-success-light text-app-success focus:ring-app-success':
              variant === VisualIntent.Success,
          },
          className,
        ])}
        {...props}
      />
      {errorMessage && (
        <span className='text-sm text-app-error'>{errorMessage}</span>
      )}
    </div>
  );
};
