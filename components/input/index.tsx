import React from 'react';
import cc from 'classcat';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  inputSize?: 'sm' | 'md' | 'lg';
  label?: string;
  error?: string;
  id: string;
}

export const Input = ({
  inputSize = 'md',
  label,
  error,
  className,
  id,
  ...props
}: InputProps) => {
  const sizeClasses = {
    sm: 'p-2 text-sm',
    md: 'p-3 text-base',
    lg: 'p-4 text-lg',
  };

  return (
    <div className='flex flex-col space-y-2'>
      {label && (
        <label htmlFor={id} className='font-medium text-app'>
          {label}
        </label>
      )}
      <input
        id={id}
        name={id}
        className={cc([
          'font-medium rounded-md transition-all duration-150 focus:outline-none focus:ring-2',
          sizeClasses[inputSize],
          {
            'border border-app-border bg-app-background text-app focus:ring-app-primary':
              !error,
            'border border-app-error bg-app-error-light text-app-error focus:ring-app-error':
              !!error,
          },
          className,
        ])}
        {...props}
      />
      {error && <span className='text-sm text-app-error'>{error}</span>}
    </div>
  );
};
