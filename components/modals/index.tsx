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
    full: 'w-full h-full max-h-screen',
  };

  const handleClose = () => {
    if (onClose) onClose();
    if (isMounted.current) closeModalInstance(id);
  };

  return (
    <Transition show={isOpen(id)} as={Fragment}>
      <Dialog
        as='div'
        className='fixed inset-0 z-50 overflow-hidden'
        onClose={handleClose}
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-content`}
      >
        {/* Backdrop */}
        <TransitionChild
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <DialogBackdrop className='fixed inset-0 bg-black bg-opacity-80' />
        </TransitionChild>

        {/* Dialog Container */}
        <div
          className={cc([
            'fixed inset-0 flex items-center justify-center p-4',
            size === 'full' && 'h-screen w-screen',
          ])}
        >
          <TransitionChild
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0 scale-95'
            enterTo='opacity-100 scale-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100 scale-100'
            leaveTo='opacity-0 scale-95'
          >
            <DialogPanel
              className={cc([
                'bg-gray-900 p-6 rounded-lg shadow-lg relative overflow-y-auto',
                sizeClasses[size],
                size === 'full' && 'w-screen h-screen rounded-none',
                className,
              ])}
            >
              {/* Close Button */}
              <IconButton
                className='absolute top-4 right-4 p-2 h-10 w-10'
                onClick={handleClose}
                aria-label='Close modal'
                icon='XMarkIcon'
              />

              {/* Title (Optional) */}
              {title && (
                <DialogTitle
                  id={`${id}-title`}
                  className='text-lg font-bold mb-4'
                >
                  {title}
                </DialogTitle>
              )}

              {/* Custom Content */}
              <div
                id={`${id}-content`}
                className={size === 'full' ? 'h-full w-full' : ''}
              >
                {children}
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
};
