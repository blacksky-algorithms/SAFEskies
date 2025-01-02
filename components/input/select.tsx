import { Fragment } from 'react';
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from '@headlessui/react';
import cc from 'classcat';

export interface Option {
  label: string;
  value: string;
}

export interface SelectProps {
  label?: string;
  error?: string;
  id: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export const Select = ({
  label,
  error,
  className,
  id,
  options,
  value,
  onChange,
  placeholder = 'Select an option', // Default placeholder
}: SelectProps) => {
  return (
    <div className='flex flex-col space-y-2'>
      {label && (
        <label htmlFor={id} className='font-medium text-app'>
          {label}
        </label>
      )}
      <Listbox value={value} onChange={onChange}>
        <div className='relative'>
          <ListboxButton
            className={cc([
              'relative w-full py-3 pl-3 pr-10 text-left bg-app-background rounded-md shadow-md cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-app-primary',
              {
                'border border-app-border text-app': !error,
                'border border-app-error text-app-error': !!error,
              },
              className,
            ])}
          >
            <span
              className={cc([
                'block truncate',
                { 'text-app-secondary': !value, 'text-app': value },
              ])}
            >
              {value
                ? options.find((option) => option.value === value)?.label
                : placeholder}
            </span>
            <span className='absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none'>
              <svg
                className='w-5 h-5 text-gray-400'
                viewBox='0 0 20 20'
                fill='none'
                stroke='currentColor'
              >
                <path
                  d='M7 7l3-3 3 3m0 6l-3 3-3-3'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </span>
          </ListboxButton>
          <Transition
            as={Fragment}
            leave='transition ease-in duration-100'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <ListboxOptions className='absolute z-10 w-full py-1 mt-1 overflow-auto text-base bg-app-background rounded-md shadow-lg max-h-page ring-1 ring-black ring-opacity-5 focus:outline-none'>
              {options.map((option) => (
                <ListboxOption
                  key={option.value}
                  className={({ selected }) =>
                    cc([
                      'cursor-default select-none relative py-2 pl-10 pr-4',
                      {
                        'text-app-primary bg-app-secondary-hover': selected,
                        'text-app': !selected,
                      },
                    ])
                  }
                  value={option.value}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={cc([
                          'block truncate',
                          { 'font-medium': selected, 'font-normal': !selected },
                        ])}
                      >
                        {option.label}
                      </span>
                      {selected && (
                        <span className='absolute inset-y-0 left-0 flex items-center pl-3 text-app-primary'>
                          <svg
                            className='w-5 h-5'
                            viewBox='0 0 20 20'
                            fill='currentColor'
                          >
                            <path
                              fillRule='evenodd'
                              d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                              clipRule='evenodd'
                            />
                          </svg>
                        </span>
                      )}
                    </>
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </Transition>
        </div>
      </Listbox>
      {error && <span className='text-sm text-app-error'>{error}</span>}
    </div>
  );
};
