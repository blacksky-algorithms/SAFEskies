import React from 'react';
import cc from 'classcat';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'text-button';
  children: React.ReactNode;
  noPadding?: boolean;
}

export const Button = ({
  variant = 'primary',
  children,
  className,
  noPadding,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cc([
        'font-medium rounded-md transition-all duration-150 focus:outline-none focus:ring-2 w-full',
        {
          'bg-app-primary text-white hover:bg-app-primary-hover focus:ring-app-primary':
            variant === 'primary',
          'bg-app-secondary text-white hover:bg-app-secondary-hover focus:ring-app-secondary':
            variant === 'secondary',
          'bg-app-error text-white hover:bg-app-error-hover focus:ring-app-error':
            variant === 'error',
          'bg-app-info text-white hover:bg-app-info-hover focus:ring-app-info':
            variant === 'info',
          'bg-app-success text-white hover:bg-app-success-hover focus:ring-app-success':
            variant === 'success',
          'text-app-text hover:text-app-text-hover focus:underline bg-transparent':
            variant === 'text-button',
          'p-2': !noPadding,
        },
        className,
      ])}
      {...props}
    >
      {children}
    </button>
  );
};
