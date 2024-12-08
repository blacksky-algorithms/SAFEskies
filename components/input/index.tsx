import React from 'react';
import cc from 'classcat';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'error' | 'success' | 'info';
  label?: string;
  errorMessage?: string;
}

export const Input = ({
  variant = 'default',
  label,
  errorMessage,
  className,
  ...props
}: InputProps) => {
  return (
    <div className='flex flex-col space-y-2'>
      {label && <label className='font-medium text-app-text'>{label}</label>}
      <input
        className={cc([
          'font-medium rounded-md transition-all duration-150 focus:outline-none focus:ring-2 p-4',
          {
            'border border-app-border bg-app-background text-app-text focus:ring-app-primary':
              variant === 'default',
            'border border-app-error bg-app-error-light text-app-error focus:ring-app-error':
              variant === 'error',
            'border border-app-success bg-app-success-light text-app-success focus:ring-app-success':
              variant === 'success',
            'border border-app-info bg-app-info-light text-app-info focus:ring-app-info':
              variant === 'info',
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
