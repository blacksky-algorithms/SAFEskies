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
  footer,
}: ModalProps) => {
  const {
    isOpen,
    closeModalInstance,
    registerModal,
    unregisterModal,
    areModalsStacking,
  } = useModal();
  const isMounted = useRef(false);
  const isFullSize = size === 'full';

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

  // Define size classes for non-full modals
  const sizeClasses = {
    small: 'w-full max-w-sm',
    medium: 'w-full max-w-md',
    large: 'w-full max-w-2xl',
    full: 'w-screen h-screen max-w-none max-h-none', // Updated for full-size
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

        {/* Main container - adjust padding based on size */}
        <div
          className={cc([
            'fixed inset-0 flex justify-center',
            {
              // Remove padding completely for full-size modals
              'p-0': isFullSize,
              // Keep existing padding logic for non-full modals
              'p-4': !isFullSize && !fullWidthMobile,
              'tablet:p-4': !isFullSize && fullWidthMobile,
            },
            { 'items-end tablet:items-center': fullWidthMobile && !isFullSize },
            { 'items-center': !fullWidthMobile && !isFullSize },
            // For full-size, don't center vertically
            { 'items-start': isFullSize },
          ])}
        >
          <TransitionChild>
            <DialogPanel
              className={cc([
                'bg-app-background shadow-lg relative flex flex-col mx-auto',
                // Apply different styles based on size
                {
                  // Full-size specific styles
                  'rounded-none w-full h-full': isFullSize,
                  // Ensure full modal has no max-height constraint and fills viewport
                  'max-h-screen': isFullSize,
                  // Non-full modal styles
                  'rounded-xl min-h-0': !isFullSize,
                  // Adjust overflow behavior
                  'overflow-hidden': isFullSize,
                  'overflow-y-auto max-h-[80dvh]': !isFullSize,
                },
                // Apply size classes
                sizeClasses[size],
                className,
              ])}
            >
              {/* Close/back button positioning */}
              <IconButton
                className={cc([
                  'h-12 w-12',
                  {
                    'self-end': !derivedShowBackButton,
                    'self-start': derivedShowBackButton,
                    'mt-4 mr-4': !isFullSize && !derivedShowBackButton,
                    'mt-4': !isFullSize && derivedShowBackButton,
                    // Full-size modal button positioning
                    'absolute top-2 right-2':
                      isFullSize && !derivedShowBackButton,
                    'absolute top-2 left-2':
                      isFullSize && derivedShowBackButton,
                  },
                ])}
                onClick={handleClose}
                aria-label={derivedShowBackButton ? 'Go back' : 'Close modal'}
                icon={derivedShowBackButton ? 'ChevronLeftIcon' : 'XMarkIcon'}
              />

              {/* Content container */}
              <div
                className={cc([
                  'w-full',
                  // For full-size modal, ensure it takes available height minus space for the buttons
                  isFullSize ? 'h-[calc(100%-4rem)]' : 'h-full',
                  'flex flex-col',
                  {
                    // Different padding for different sizes
                    'px-6 pt-14': isFullSize && !noContentPadding, // Add top padding to account for absolute positioned button
                    'p-6': !isFullSize,
                    'pt-14': isFullSize && noContentPadding, // Still need top padding for the button
                  },
                ])}
              >
                {title && (
                  <DialogTitle
                    id={`${id}-title`}
                    className={cc([
                      'text-lg font-bold',
                      {
                        'pt-6 pb-4': isFullSize,
                        'pb-4': !isFullSize,
                        'sticky -top-6 pt-2 bg-app-background z-10':
                          fullWidthMobile && !isFullSize,
                      },
                    ])}
                  >
                    {title}

                    {subtitle ? (
                      <p className='text-sm text-app-secondary pb-2 border-b border-app-border'>
                        {subtitle}
                      </p>
                    ) : null}
                  </DialogTitle>
                )}

                {/* Main content area */}
                <div
                  id={`${id}-content`}
                  className={cc([
                    // For full-size, we want to take remaining space
                    isFullSize ? 'flex-1' : 'min-h-0',
                    // Allow scrolling within the content area
                    'overflow-auto',
                    {
                      // Add bottom padding for full-size modals
                      'pb-4 tablet:pb-10': isFullSize,
                    },
                  ])}
                >
                  {children}
                </div>

                {/* Footer section if provided */}
                {footer && (
                  <div className={cc(['mt-4', isFullSize ? 'pb-4' : ''])}>
                    {footer}
                  </div>
                )}
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
};
