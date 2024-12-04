import React from 'react';
import cc from 'classcat';
import { Icon, IconProps } from '@/components/icon';

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconProps['icon'];
  variant?: IconProps['variant'];
  className?: string;
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
        'flex items-center justify-center rounded-full p-2 focus:outline-none focus:ring-1 transition-all duration-150',
        className,
      ])}
      {...props}
    >
      <Icon icon={icon} variant={variant} isButton />
    </button>
  );
};
