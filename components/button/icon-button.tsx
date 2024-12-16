import React from 'react';
import cc from 'classcat';
import { Icon, IconProps } from '@/components/icon';
import { Button } from '@/components/button';
import { VisualIntent } from '@/enums/styles';

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconProps['icon'];
  iconPosition?: 'left' | 'right'; // Position of the icon relative to text
  variant?: VisualIntent; // Button variant
  text?: string; // Optional text for the button
  noPadding?: boolean; // Use button's noPadding property
  submitting?: boolean; // Use button's submitting property
}

export const IconButton = ({
  icon,
  iconPosition = 'left',
  variant = VisualIntent.Primary,
  text,
  className,
  noPadding,
  submitting = false,
  disabled = false,
  ...props
}: IconButtonProps) => {
  const isIconOnly = !text; // Determines if the button is icon-only
  const isDisabled = disabled || submitting; // Account for both disabled and submitting states

  // Icon rendering
  const renderIcon = () => (
    <Icon icon={icon} variant={variant} isButton={!text} />
  );

  // Accessibility: Set aria-label if the button has no text
  const accessibleLabel =
    props['aria-label'] || (isIconOnly ? icon : undefined);

  if (isIconOnly) {
    // Icon-only button
    return (
      <button
        className={cc([
          'flex items-center justify-center rounded-full p-2 focus:outline-none focus:ring-1 transition-all duration-150',
          {
            'opacity-50 cursor-not-allowed': isDisabled,
          },
          className,
        ])}
        disabled={isDisabled}
        aria-label={accessibleLabel}
        aria-busy={submitting || undefined}
        {...props}
      >
        {submitting ? (
          <span className='flex items-center'>
            <Icon icon='loader' variant={variant} isButton />
          </span>
        ) : (
          renderIcon()
        )}
      </button>
    );
  }

  // Icon with text: Render a full button
  return (
    <Button
      variant={variant}
      noPadding={noPadding}
      submitting={submitting}
      disabled={isDisabled}
      className={cc(['flex items-center', className])}
      aria-label={accessibleLabel}
      {...props}
    >
      {iconPosition === 'left' && <span className='mr-2'>{renderIcon()}</span>}
      <span>{text}</span>
      {iconPosition === 'right' && <span className='ml-2'>{renderIcon()}</span>}
    </Button>
  );
};
