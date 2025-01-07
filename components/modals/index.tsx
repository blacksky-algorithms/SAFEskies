'use client';

import { useModal } from '@/contexts/modal-context';
import { ModalProps } from '@/types/modal-types';
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { Fragment, useEffect, useRef } from 'react';
import { IconButton } from '@/components/button/icon-button';
import cc from 'classcat';

export const Modal = ({
  id,
  title,
  children,
  size = 'medium',
  className = '',
  onClose,
  noContentPadding,
}: ModalProps) => {
  const { isOpen, closeModalInstance, registerModal, unregisterModal } =
    useModal();
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    registerModal(id);
    return () => {
      unregisterModal(id);
      isMounted.current = false;
    };
  }, [id, registerModal, unregisterModal]);

  const sizeClasses = {
    small: 'max-w-sm',
    medium: 'max-w-md',
    large: 'max-w-2xl',
    full: 'w-screen h-screen max-w-screen max-h-screen',
  };

  const handleClose = () => {
    if (onClose) onClose();
    if (isMounted.current) closeModalInstance(id);
  };

  return (
    <Transition show={isOpen(id)} as={Fragment}>
      <Dialog
        as='div'
        className='fixed inset-0 z-50'
        onClose={handleClose}
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-content`}
      >
        <TransitionChild>
          <DialogBackdrop className='fixed inset-0 bg-black bg-opacity-80' />
        </TransitionChild>
        <div
          className={cc([
            'fixed inset-0 flex items-center justify-center',
            { 'p-4': size !== 'full' },
          ])}
        >
          <TransitionChild>
            <DialogPanel
              className={cc([
                'bg-app-background shadow-lg relative flex flex-col',
                {
                  'w-screen h-screen rounded-none overflow-hidden':
                    size === 'full',
                  'p-6 rounded-lg overflow-y-auto': size !== 'full',
                },
                sizeClasses[size],
                className,
              ])}
            >
              <IconButton
                className={cc([' p-2 h-12 w-12 self-end'])}
                onClick={handleClose}
                aria-label='Close modal'
                icon='XMarkIcon'
              />

              <div
                className={cc([
                  'w-full h-full',
                  'flex flex-col',
                  {
                    'px-6': size === 'full' && !noContentPadding,
                  },
                ])}
              >
                {title && (
                  <DialogTitle
                    id={`${id}-title`}
                    className={cc([
                      'text-lg font-bold',
                      {
                        'pt-6 mb-4': size === 'full',
                        'mb-4': size !== 'full',
                      },
                    ])}
                  >
                    {title}
                  </DialogTitle>
                )}
                <div
                  id={`${id}-content`}
                  className={cc([
                    'flex-1',
                    'min-h-0',
                    {
                      'overflow-hidden': size === 'full',
                      'pb-6': size === 'full',
                    },
                  ])}
                >
                  {children}
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
};
