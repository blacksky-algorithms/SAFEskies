import { Fragment, useEffect } from 'react';
import { Transition } from '@headlessui/react';
import { VisualIntent } from '@/enums/styles';
import cc from 'classcat';
import { Icon } from '../icon';

export interface ToastProps {
  message: string;
  title?: string;
  intent?: Exclude<VisualIntent, VisualIntent.TextButton>;
  show: boolean;
  onClose: () => void;
}

export function Toast({
  message,
  title,
  intent = VisualIntent.Info,
  show,
  onClose,
}: ToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  const intentClasses = {
    [VisualIntent.Primary]: 'bg-app-primary text-white',
    [VisualIntent.Success]: 'bg-app-success text-white',
    [VisualIntent.Error]: 'bg-app-error text-white',
    [VisualIntent.Info]: 'bg-app-info text-white',
    [VisualIntent.Secondary]: 'bg-app-secondary text-white',
  };

  return (
    <Transition
      show={show}
      as={Fragment}
      enter='transform ease-out duration-300 transition'
      enterFrom='translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2'
      enterTo='translate-y-0 opacity-100 sm:translate-x-0'
      leave='transition ease-in duration-100'
      leaveFrom='opacity-100'
      leaveTo='opacity-0'
    >
      <div className='fixed inset-0 z-50 flex items-start justify-center px-4 py-6 pointer-events-none sm:p-6'>
        <div
          className={cc([
            'w-full max-w-2xl overflow-hidden rounded-lg shadow-lg pointer-events-auto',
            intentClasses[intent],
          ])}
        >
          <div className='p-4'>
            <div className='flex items-start'>
              <div className='flex-1'>
                {title && (
                  <h3 className='text-sm font-medium text-opacity-90'>
                    {title}
                  </h3>
                )}
                <p className='mt-1 text-sm'>{message}</p>
              </div>
              <button
                onClick={onClose}
                className='flex-shrink-0 ml-4 text-sm font-medium rounded-md hover:text-opacity-75'
              >
                <Icon icon='XMarkIcon' intent={VisualIntent.Info} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  );
}
