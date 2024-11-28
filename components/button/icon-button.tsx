import React from 'react';
import cc from 'classcat';
import { Icon, IconProps } from '@/components/icon';

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconProps['icon']; // Reuse the Icon's "icon" type
  variant?: IconProps['variant']; // Reuse the Icon's "variant" type
}

export const IconButton = ({
  icon,
  variant,
  className,
  ...props
}: IconButtonProps) => {
  const buttonStyles = cc([
    'inline-flex items-center justify-center focus:outline-none focus:ring-2 transition-all duration-150',
    className, // Allow custom positioning or padding
  ]);

  return (
    <button className={buttonStyles} {...props}>
      <Icon icon={icon} variant={variant} />
    </button>
  );
};
