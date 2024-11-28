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
  const buttonStyles = cc([
    'font-medium rounded-md transition-all duration-150 focus:outline-none focus:ring-2',
    {
      'bg-theme-btn-primary text-white hover:bg-theme-btn-primary-hover focus:ring-theme-btn-primary':
        variant === 'primary',
      'bg-theme-btn-secondary text-white hover:bg-theme-btn-secondary-hover focus:ring-theme-btn-secondary':
        variant === 'secondary',
      'bg-theme-btn-error text-white hover:bg-theme-btn-error-hover focus:ring-theme-btn-error':
        variant === 'error',
      'bg-theme-btn-info text-white hover:bg-theme-btn-info-hover focus:ring-theme-btn-info':
        variant === 'info',
      'bg-theme-btn-success text-white hover:bg-theme-btn-success-hover focus:ring-theme-btn-success':
        variant === 'success',
      'text-theme-btn-text hover:text-theme-btn-text-hover focus:underline bg-transparent':
        variant === 'text-button',
    },
    className, // Allow for additional custom styles
  ]);

  return (
    <button className={buttonStyles} {...props}>
      {children}
    </button>
  );
};
