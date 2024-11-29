import React from 'react';
import cc from 'classcat';
import { Icon, IconProps } from '@/components/icon';

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconProps['icon'];
  variant?: IconProps['variant'];
}

export const IconButton = ({
  icon,
  variant,
  className,
  ...props
}: IconButtonProps) => {
  return (
    <button
      className={cc([
        'inline-flex items-center justify-center focus:outline-none focus:ring-2 transition-all duration-150',
        className,
      ])}
      {...props}
    >
      <Icon icon={icon} variant={variant} />
    </button>
  );
};
