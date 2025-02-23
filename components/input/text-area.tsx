import React, { useState, ChangeEvent } from 'react';
import cc from 'classcat';

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  id: string;
  maxLength?: number;
}

export const Textarea = ({
  label,
  error,
  id,
  maxLength,
  className,
  onChange,
  ...props
}: TextareaProps) => {
  const [charCount, setCharCount] = useState(0);

  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    setCharCount(newValue.length);
    if (onChange) {
      onChange(event);
    }
  };

  // If a maxLength is provided, calculate remaining characters.
  const remainingChars =
    typeof maxLength === 'number' ? maxLength - charCount : charCount;
  const isOverLimit =
    typeof maxLength === 'number' ? charCount > maxLength : false;

  return (
    <div className='flex flex-col space-y-2'>
      {label && (
        <label htmlFor={id} className='font-medium text-app'>
          {label}
        </label>
      )}
      <div className='relative'>
        <textarea
          id={id}
          name={id}
          className={cc([
            'font-medium rounded-md transition-all duration-150 focus:outline-none focus:ring-2 w-full p-4',
            {
              'border border-app-border bg-app-background text-app focus:ring-app-primary':
                !error && !isOverLimit,
              'border border-app-error text-app-error focus:ring-app-error':
                error || isOverLimit,
            },
            className,
          ])}
          onChange={handleInputChange}
          {...props}
        />
        <span
          className={cc([
            'absolute bottom-4 right-4 text-sm',
            { 'text-app-error': isOverLimit },
          ])}
        >
          {typeof maxLength === 'number' ? remainingChars : charCount}
        </span>
      </div>
      {error && <span className='text-sm text-app-error'>{error}</span>}
    </div>
  );
};
