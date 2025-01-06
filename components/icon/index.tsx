import React from 'react';
import * as HeroIconsOutline from '@heroicons/react/24/outline';
import * as HeroIconsSolid from '@heroicons/react/24/solid';
import cc from 'classcat';
import { VisualIntent, SharedSize } from '@/enums/styles';
import { LoadingSpinner } from '@/components/loading-spinner';

export interface IconProps extends React.HTMLAttributes<SVGElement> {
  icon: keyof typeof HeroIconsOutline | 'loader';
  intent?: Exclude<VisualIntent, VisualIntent.TextButton>;
  isButton?: boolean;
  size?: keyof typeof SharedSize;
  'aria-label'?: string;
  type?: 'outline' | 'solid';
}

const itentClasses: Record<
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
  intent = VisualIntent.Primary,
  className,
  isButton = false,
  size = 'md',
  type = 'outline',
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
        intent={intent}
        {...(defaultAriaLabel && { 'aria-label': defaultAriaLabel })}
      />
    );
  }

  // refactor so that IconComponent can be either HeroIconsOutline or HeroIconsSolid
  const IconComponent =
    type === 'solid' ? HeroIconsSolid[icon] : HeroIconsOutline[icon];

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
        itentClasses[intent],
        { 'w-full h-full': isButton },
        className,
      ])}
      {...props}
    />
  );
};
