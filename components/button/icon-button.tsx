import React from 'react';
import cc from 'classcat';
import { Icon, IconProps } from '@/components/icon';
import { Button } from '@/components/button';
import { VisualIntent, SharedSize } from '@/enums/styles';

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconProps['icon'];
  iconPosition?: 'left' | 'right';
  intent?: Exclude<VisualIntent, VisualIntent.TextButton>;
  text?: string;
  size?: keyof typeof SharedSize;
  noPadding?: boolean;
  submitting?: boolean;
}

export const IconButton = ({
  icon,
  iconPosition = 'left',
  intent = VisualIntent.Primary,
  size = 'md',
  text,
  className,
  noPadding,
  submitting = false,
  disabled = false,
  ...props
}: IconButtonProps) => {
  const isIconOnly = !text;
  const isDisabled = disabled || submitting;

  const iconSize = SharedSize[size];

  // Accessibility: Set aria-label if the button has no text
  const accessibleLabel =
    props['aria-label'] || (isIconOnly ? icon : undefined);

  // Icon rendering
  const renderIcon = () => (
    <Icon
      icon={icon}
      intent={intent}
      isButton={!text}
      size={size} // Pass the size to match SharedSize
    />
  );

  if (isIconOnly) {
    // Icon-only button
    return (
      <button
        className={cc([
          'flex items-center justify-center rounded-full focus:outline-none focus:ring-2 transition-all duration-150',
          iconSize,
          {
            'opacity-50 cursor-not-allowed': isDisabled,
            'p-2': !noPadding,
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
            <Icon icon='loader' intent={intent} isButton size={size} />
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
      intent={intent}
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
