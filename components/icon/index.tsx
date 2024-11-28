import React from 'react';
import * as HeroIcons from '@heroicons/react/24/outline';
import cc from 'classcat';

export interface IconProps extends React.HTMLAttributes<SVGElement> {
  icon: keyof typeof HeroIcons;
  variant?: 'primary' | 'secondary' | 'error' | 'info' | 'success';
}

export const Icon = ({ icon, variant, className, ...props }: IconProps) => {
  const IconComponent = HeroIcons[icon];

  if (!IconComponent) {
    console.error(`Heroicon "${icon}" not found.`);
    return null;
  }

  const iconStyles = cc([
    'h-5 w-5', // Default size
    {
      'text-theme-btn-primary': variant === 'primary',
      'text-theme-btn-secondary': variant === 'secondary',
      'text-theme-btn-error': variant === 'error',
      'text-theme-btn-info': variant === 'info',
      'text-theme-btn-success': variant === 'success',
      'text-inherit': !variant, // Default to inherited text color
    },
    className,
  ]);

  return <IconComponent className={iconStyles} {...props} />;
};
