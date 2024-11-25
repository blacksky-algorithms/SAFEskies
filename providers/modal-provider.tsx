'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from 'react';

type ModalState = {
  isOpen: (id: string) => boolean;
  openModalInstance: (id: string, allowStacking?: boolean) => void;
  closeModalInstance: (id: string) => void;
  registerModal: (id: string) => void;
  unregisterModal: (id: string) => void;
};

// Centralized configuration
const MODAL_CONFIG = {
  MAX_STACKED_MODALS: parseInt(
    process.env.NEXT_PUBLIC_MAX_STACKED_MODALS || '3',
    10
  ),
  ENABLE_DEBUG: false /* Set to true to enable debug logs */,
};

// Validate `MAX_STACKED_MODALS`
if (isNaN(MODAL_CONFIG.MAX_STACKED_MODALS)) {
  console.warn(
    `NEXT_PUBLIC_MAX_STACKED_MODALS is not a valid number. Falling back to default value: 3.`
  );
  MODAL_CONFIG.MAX_STACKED_MODALS = 3;
}

const ModalContext = createContext<ModalState | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [modals, setModals] = useState<Record<string, boolean>>({});
  const [registeredModals, setRegisteredModals] = useState<Set<string>>(
    new Set()
  );

  const isOpen = useCallback((id: string) => !!modals[id], [modals]);

  // Open a modal with optional stacking
  const openModalInstance = useCallback(
    (id: string, allowStacking: boolean = false) => {
      if (!registeredModals.has(id)) {
        if (MODAL_CONFIG.ENABLE_DEBUG) {
          console.log(`[DEBUG] Attempt to open unregistered modal "${id}".`);
        }
        console.error(
          `Modal "${id}" is not registered. Ensure it's rendered and registered first.`
        );
        return;
      }

      const openModalInstancesCount =
        Object.values(modals).filter(Boolean).length;

      if (
        allowStacking &&
        openModalInstancesCount >= MODAL_CONFIG.MAX_STACKED_MODALS
      ) {
        console.warn(
          `Too many modals are open! Maximum allowed stacked modals is ${MODAL_CONFIG.MAX_STACKED_MODALS}.`
        );
        return;
      }

      if (!allowStacking && openModalInstancesCount > 0) {
        console.warn(
          `Opening modal "${id}" will close all other modals because stacking is disabled.`
        );
      }

      setModals((prev) => {
        if (allowStacking) {
          return { ...prev, [id]: true }; // Open modal without closing others
        }
        return { [id]: true }; // Close all other modals and open this one
      });

      if (MODAL_CONFIG.ENABLE_DEBUG) {
        console.log(`[DEBUG] Opened modal "${id}". Current state:`, modals);
      }
    },
    [modals, registeredModals]
  );

  // Close a modal
  const closeModalInstance = useCallback(
    (id: string) => {
      if (!registeredModals.has(id)) {
        console.error(`Modal "${id}" is not registered or currently open.`);
        return;
      }

      setModals((prev) => ({ ...prev, [id]: false }));

      if (MODAL_CONFIG.ENABLE_DEBUG) {
        console.log(`[DEBUG] Closed modal "${id}". Current state:`, modals);
      }
    },
    [registeredModals]
  );

  // Register a modal ID
  const registerModal = useCallback((id: string) => {
    setRegisteredModals((prev) => {
      if (prev.has(id)) {
        console.warn(
          `Modal "${id}" is already registered. Ensure you don't register it multiple times.`
        );
        return prev;
      }
      if (MODAL_CONFIG.ENABLE_DEBUG) {
        console.log(`[DEBUG] Registered modal: "${id}".`);
      }
      return new Set([...prev, id]);
    });
  }, []);

  // Unregister a modal ID
  const unregisterModal = useCallback((id: string) => {
    setRegisteredModals((prev) => {
      if (!prev.has(id)) {
        console.warn(`Modal "${id}" is not registered. Cannot unregister.`);
        return prev;
      }
      if (MODAL_CONFIG.ENABLE_DEBUG) {
        console.log(`[DEBUG] Unregistered modal: "${id}".`);
      }
      // Create a new Set by filtering out the specified ID
      return new Set([...prev].filter((modalId) => modalId !== id));
    });

    // Remove the modal from the `modals` state
    setModals((prev) => {
      const { [id]: _, ...rest } = prev; // Omit the modal ID from the state
      return rest;
    });
  }, []);

  if (MODAL_CONFIG.ENABLE_DEBUG) {
    console.log('[DEBUG] Current modal state:', { modals, registeredModals });
  }

  return (
    <ModalContext.Provider
      value={{
        isOpen,
        openModalInstance,
        closeModalInstance,
        registerModal,
        unregisterModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider.');
  }
  return context;
};
