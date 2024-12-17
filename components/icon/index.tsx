import React from 'react';
import * as HeroIcons from '@heroicons/react/24/outline';
import cc from 'classcat';
import { VisualIntent, SharedSize } from '@/enums/styles';
import { LoadingSpinner } from '@/components/loading-spinner';

export interface IconProps extends React.HTMLAttributes<SVGElement> {
  icon: keyof typeof HeroIcons | 'loader';
  variant?: Exclude<VisualIntent, VisualIntent.TextButton>;
  isButton?: boolean;
  size?: keyof typeof SharedSize;
  'aria-label'?: string;
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
  'aria-label': ariaLabel,
  ...props
}: IconProps) => {
  const sizeClass = SharedSize[size];

  // Default accessible name for interactive icons
  const defaultAriaLabel =
    isButton && !ariaLabel ? icon.replace(/([A-Z])/g, ' $1').trim() : undefined;

  // Use the LoadingSpinner for the loader icon
  if (icon === 'loader') {
    return (
      <LoadingSpinner
        size={size}
        variant={variant}
        {...(defaultAriaLabel && { 'aria-label': defaultAriaLabel })}
      />
    );
  }

  const IconComponent = HeroIcons[icon];

  if (!IconComponent) {
    console.error(`Heroicon "${icon}" not found.`);
    return null;
  }

  return (
    <IconComponent
      aria-label={ariaLabel || defaultAriaLabel}
      className={cc([
        'block',
        sizeClass,
        variantClasses[variant],
        { 'w-full h-full': isButton },
        className,
      ])}
      {...props}
    />
  );
};
