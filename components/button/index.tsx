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
}

export const Button = ({
  variant = 'primary',
  children,
  className,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cc([
        'font-medium rounded-md transition-all duration-150 focus:outline-none focus:ring-2',
        {
          'bg-theme-primary text-white hover:bg-theme-primary-hover focus:ring-theme-primary':
            variant === 'primary',
          'bg-theme-secondary text-white hover:bg-theme-secondary-hover focus:ring-theme-secondary':
            variant === 'secondary',
          'bg-theme-error text-white hover:bg-theme-error-hover focus:ring-theme-error':
            variant === 'error',
          'bg-theme-info text-white hover:bg-theme-info-hover focus:ring-theme-info':
            variant === 'info',
          'bg-theme-success text-white hover:bg-theme-success-hover focus:ring-theme-success':
            variant === 'success',
          'text-theme-text hover:text-theme-text-hover focus:underline bg-transparent':
            variant === 'text-button',
        },
        className,
      ])}
      {...props}
    >
      {children}
    </button>
  );
};
