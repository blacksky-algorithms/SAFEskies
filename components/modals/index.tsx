'use client';

import { useModal } from '@/contexts/modal-context';
import { ModalProps } from '@/lib/types/modal-types';
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
  subtitle,
  children,
  size = 'medium',
  className = '',
  onClose,
  noContentPadding,
  fullWidthMobile,
  showBackButton,
}: ModalProps) => {
  const {
    isOpen,
    closeModalInstance,
    registerModal,
    unregisterModal,
    areModalsStacking,
  } = useModal();
  const isMounted = useRef(false);

  const derivedShowBackButton =
    areModalsStacking && showBackButton !== false
      ? true
      : showBackButton || false;

  useEffect(() => {
    isMounted.current = true;
    registerModal(id);
    return () => {
      unregisterModal(id);
      isMounted.current = false;
    };
  }, [id, registerModal, unregisterModal]);

  const sizeClasses = {
    small: 'w-full max-w-sm',
    medium: 'w-full max-w-md',
    large: 'w-full max-w-2xl',
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
            'fixed inset-0 flex justify-center',
            { 'p-4': size !== 'full' && !fullWidthMobile },
            { 'tablet:p-4': size !== 'full' && fullWidthMobile },
            { 'items-end tablet:items-center': fullWidthMobile },
            { 'items-center': !fullWidthMobile },
          ])}
        >
          <TransitionChild>
            <DialogPanel
              className={cc([
                'bg-app-background shadow-lg relative flex flex-col w-full mx-auto',
                {
                  'w-screen h-screen rounded-none overflow-hidden p-4':
                    size === 'full',
                  'rounded-xl overflow-y-auto min-h-0 max-h-[80dvh]':
                    size !== 'full',
                },
                sizeClasses[size],
                className,
              ])}
            >
              <IconButton
                className={cc([
                  'h-12 w-12 ',
                  {
                    'self-end': !derivedShowBackButton,
                    'self-start': derivedShowBackButton,
                    'mt-4 mr-4': size !== 'full' && !derivedShowBackButton,
                    'mt-4': size !== 'full' && derivedShowBackButton,
                  },
                ])}
                onClick={handleClose}
                aria-label={derivedShowBackButton ? 'Go back' : 'Close modal'}
                icon={derivedShowBackButton ? 'ChevronLeftIcon' : 'XMarkIcon'}
              />

              <div
                className={cc([
                  'w-full h-full',
                  'flex flex-col',
                  {
                    'px-6': size === 'full' && !noContentPadding,
                    'p-6 ': size !== 'full',
                  },
                ])}
              >
                {title && (
                  <DialogTitle
                    id={`${id}-title`}
                    className={cc([
                      'text-lg font-bold',
                      {
                        'pt-6 pb-4': size === 'full',
                        'pb-4': size !== 'full',
                        'sticky -top-6 pt-2  bg-app-background z-10 ':
                          fullWidthMobile,
                      },
                    ])}
                  >
                    {title}

                    {subtitle ? (
                      <p className='text-sm text-app-secondary pb-2   border-b border-app-border'>
                        {subtitle}
                      </p>
                    ) : null}
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
