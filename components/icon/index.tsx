import React from 'react';
import * as HeroIcons from '@heroicons/react/24/outline';
import cc from 'classcat';
import { VisualIntent, SharedSize } from '@/enums/styles';

export interface IconProps extends React.HTMLAttributes<SVGElement> {
  icon: keyof typeof HeroIcons | 'loader';
  variant?: Exclude<VisualIntent, VisualIntent.TextButton>;
  isButton?: boolean;
  size?: keyof typeof SharedSize;
}

const variantClasses: Record<
  Exclude<VisualIntent, VisualIntent.TextButton>,
  string
> = {
  [VisualIntent.Primary]: 'text-app-primary',
  [VisualIntent.Secondary]: 'text-app-secondary',
  [VisualIntent.Error]: 'text-app-error',
  [VisualIntent.Info]: 'text-app-info',
  [VisualIntent.Success]: 'text-app-success',
};

export const Icon = ({
  icon,
  variant = VisualIntent.Primary,
  className,
  isButton = false,
  size = 'md',
  ...props
}: IconProps) => {
  const sizeClass = SharedSize[size];

  if (icon === 'loader') {
    return (
      <svg
        className={cc([
          'animate-spin',
          sizeClass,
          variantClasses[variant],
          className,
        ])}
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 24 24'
        fill='none'
        {...props}
      >
        <circle
          className='opacity-25'
          cx='12'
          cy='12'
          r='10'
          stroke='currentColor'
          strokeWidth='4'
        ></circle>
        <path
          className='opacity-75'
          fill='currentColor'
          d='M4 12a8 8 0 018-8v8H4z'
        ></path>
      </svg>
    );
  }

  const IconComponent = HeroIcons[icon];

  if (!IconComponent) {
    console.error(`Heroicon "${icon}" not found.`);
    return null;
  }

  return (
    <IconComponent
      className={cc([
        'block',
        sizeClass,
        variantClasses[variant],
        {
          'w-full h-full': isButton,
        },
        className,
      ])}
      {...props}
    />
  );
};
