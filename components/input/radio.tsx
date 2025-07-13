import React from 'react';
import cc from 'classcat';
import { VisualIntent, SharedSize } from '@/enums/styles';

export interface RadioOption {
  label: string;
  value: string;
}

export interface RadioGroupProps {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  name: string;
  label?: string;
  intent?: Exclude<VisualIntent, VisualIntent.TextButton>;
  radioSize?: keyof typeof SharedSize;
  disabled?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

export const RadioGroup = ({
  options,
  value,
  onChange,
  name,
  label,
  intent = VisualIntent.Primary,
  radioSize = 'sm',
  disabled = false,
  orientation = 'horizontal',
}: RadioGroupProps) => {
  const intentColors = {
    [VisualIntent.Primary]: 'text-app-primary border-app-primary',
    [VisualIntent.Secondary]: 'text-app-secondary border-app-secondary',
    [VisualIntent.Error]: 'text-app-error border-app-error',
    [VisualIntent.Info]: 'text-app-info border-app-info',
    [VisualIntent.Success]: 'text-app-success border-app-success',
  };

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10',
  };

  const labelTextSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const computedIntent = disabled ? VisualIntent.Secondary : intent;

  return (
    <fieldset className="space-y-2">
      {label && (
        <legend className={cc(['font-medium text-app', labelTextSizeClasses[radioSize]])}>
          {label}
        </legend>
      )}
      <div
        className={cc([
          'flex gap-4',
          {
            'flex-col': orientation === 'vertical',
            'flex-row': orientation === 'horizontal',
          },
        ])}
      >
        {options.map((option) => (
          <label
            key={option.value}
            htmlFor={`${name}-${option.value}`}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <div
              className={cc([
                'relative flex items-center justify-center border-2 rounded-full bg-app-background transition-all duration-150',
                sizeClasses[radioSize],
                intentColors[computedIntent],
                {
                  'cursor-not-allowed opacity-50': disabled,
                },
              ])}
            >
              <input
                id={`${name}-${option.value}`}
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="absolute w-full h-full opacity-0 cursor-pointer"
              />
              {value === option.value && (
                <div
                  className={cc([
                    'rounded-full transition-all duration-150',
                    {
                      'w-2 h-2': radioSize === 'sm',
                      'w-3 h-3': radioSize === 'md',
                      'w-4 h-4': radioSize === 'lg',
                      'w-5 h-5': radioSize === 'xl',
                    },
                    intentColors[computedIntent].split(' ')[0], // Get just the text color for the dot
                  ])}
                  style={{
                    backgroundColor: 'currentColor',
                  }}
                />
              )}
            </div>
            <span className={cc(['text-app', labelTextSizeClasses[radioSize]])}>
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
};
