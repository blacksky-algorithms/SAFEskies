'use client';

import { useModal } from '@/providers/modal-provider';
import { BaseModalProps } from '@/types/modal-types';
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { Fragment, useEffect } from 'react';

export const BaseModal = ({
  id,
  title,
  children,
  size = 'medium',
}: BaseModalProps) => {
  const { isOpen, closeModalInstance, registerModal, unregisterModal } =
    useModal();

  // Register the modal on mount and unregister on unmount
  useEffect(() => {
    registerModal(id);
    return () => unregisterModal(id);
  }, [id, registerModal, unregisterModal]);

  // Determine modal width based on size
  const sizeClasses = {
    small: 'max-w-sm',
    medium: 'max-w-md',
    large: 'max-w-2xl',
    full: 'w-full h-full',
  };

  return (
    <Transition show={isOpen(id)} as={Fragment}>
      <Dialog
        as='div'
        className='fixed inset-0 z-50'
        onClose={() => closeModalInstance(id)}
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

        {/* Dialog Panel */}
        <div className='fixed inset-0 flex items-center justify-center'>
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
              className={`bg-gray-900 text-white p-6 rounded-lg shadow-lg relative overflow-y-auto ${sizeClasses[size]}`}
            >
              {/* Close Button */}
              <button
                className='absolute top-4 right-4 bg-gray-700 text-white p-2 rounded-full hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
                onClick={() => closeModalInstance(id)}
                aria-label='Close modal'
              >
                ✕
              </button>

              {/* Title (Optional) */}
              {title && (
                <DialogTitle className='text-lg font-bold mb-4'>
                  {title}
                </DialogTitle>
              )}

              {/* Custom Content */}
              {children}
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
};
