import React from 'react';
import cc from 'classcat';
import { Icon, IconProps } from '@/components/icon';
import { Button } from '@/components/button';
import { VisualIntent } from '@/enums/styles';

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconProps['icon'];
  iconPosition?: 'left' | 'right';
  variant?: VisualIntent;
  text?: string;
  noPadding?: boolean;
  submitting?: boolean;
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
  const isIconOnly = !text;
  const isDisabled = disabled || submitting;

  // Narrow the variant for the Icon to exclude TextButton
  const iconVariant: Exclude<VisualIntent, VisualIntent.TextButton> =
    variant === VisualIntent.TextButton ? VisualIntent.Primary : variant;

  // Icon rendering
  const renderIcon = () => (
    <Icon icon={icon} variant={iconVariant} isButton={!text} />
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
            <Icon icon='loader' variant={iconVariant} isButton />
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
