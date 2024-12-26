import React from 'react';
import cc from 'classcat';
import { VisualIntent, SharedSize } from '@/enums/styles';
import { Icon } from '../icon';

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  intent?: Exclude<VisualIntent, VisualIntent.TextButton>;
  checkboxSize?: keyof typeof SharedSize;
}

export const Checkbox = ({
  label,
  intent = VisualIntent.Primary,
  checkboxSize = 'sm',
  id = 'checkbox',
  ...props
}: CheckboxProps) => {
  const intentColors = {
    [VisualIntent.Primary]: 'text-app-primary border border-app-primary',
    [VisualIntent.Secondary]: 'text-app-secondary border border-app-secondary',
    [VisualIntent.Error]: 'text-app-error border border-app-error',
    [VisualIntent.Info]: ' text-app-info border border-app-info',
    [VisualIntent.Success]: 'text-app-success border border-app-success',
  };

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10',
  };

  const roundedClasses = {
    sm: 'rounded-md',
    md: 'rounded-lg',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
  };

  const paddingClasses = {
    sm: 'p-2.5',
    md: 'p-3',
    lg: 'p-3.5',
    xl: 'p-4',
  };

  const labelTextSizeClasses = {
    sm: 'text-base',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  return (
    <label htmlFor={id} className='flex items-center space-x-2 cursor-pointer'>
      <div
        className={cc([
          'relative flex items-center justify-center bg-app-background transition-all duration-150',
          sizeClasses[checkboxSize],
          roundedClasses[checkboxSize],
          intentColors[intent],
          paddingClasses[checkboxSize],
        ])}
      >
        <input
          id={id}
          type='checkbox'
          className='absolute w-full h-full opacity-0 cursor-pointer'
          {...props}
        />
        <span
          className={cc([
            'absolute inset-0 flex items-center justify-center transition-all duration-150',
            roundedClasses[checkboxSize],
            intentColors[intent],
          ])}
        >
          {props.checked && (
            <Icon
              icon='CheckIcon'
              intent={intent}
              isButton={false}
              size={checkboxSize}
            />
          )}
        </span>
      </div>
      <span className={cc(['text-app', labelTextSizeClasses[checkboxSize]])}>
        {label}
      </span>
    </label>
  );
};
