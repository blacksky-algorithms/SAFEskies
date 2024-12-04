import React from 'react';
import * as HeroIcons from '@heroicons/react/24/outline';
import cc from 'classcat';

export interface IconProps extends React.HTMLAttributes<SVGElement> {
  icon: keyof typeof HeroIcons;
  variant?: 'primary' | 'secondary' | 'error' | 'info' | 'success';
  isButton?: boolean;
}

export const Icon = ({
  icon,
  variant = 'primary',
  className,
  isButton = false,
  ...props
}: IconProps) => {
  const IconComponent = HeroIcons[icon];

  if (!IconComponent) {
    console.error(`Heroicon "${icon}" not found.`);
    return null;
  }

  const iconStyles = cc([
    'block',
    {
      'text-app-primary': variant === 'primary',
      'text-app-secondary': variant === 'secondary',
      'text-app-error': variant === 'error',
      'text-app-info': variant === 'info',
      'text-app-success': variant === 'success',
      'text-inherit': !variant,
      'w-full h-full': isButton,
    },
    className,
  ]);

  return <IconComponent className={iconStyles} {...props} />;
};
