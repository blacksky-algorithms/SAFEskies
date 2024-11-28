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
  const [pendingOpens, setPendingOpens] = useState<Set<string>>(new Set());

  const isOpen = useCallback((id: string) => !!modals[id], [modals]);

  const logDebug = (message: string, data: any) => {
    if (MODAL_CONFIG.ENABLE_DEBUG) {
      console.log(`[DEBUG] ${message}`, data);
    }
  };

  const ensureModalIsRegistered = (id: string): boolean => {
    if (!registeredModals.has(id)) {
      setPendingOpens((prev) => new Set(prev).add(id));
      logDebug(`Modal "${id}" is pending registration.`, { id });
      return false;
    }
    return true;
  };

  const openModalInstance = useCallback(
    (id: string, allowStacking: boolean = false) => {
      if (!ensureModalIsRegistered(id)) return;

      const openModalCount = Object.values(modals).filter(Boolean).length;

      if (allowStacking && openModalCount >= MODAL_CONFIG.MAX_STACKED_MODALS) {
        console.warn(
          `Too many modals are open! Maximum allowed stacked modals is ${MODAL_CONFIG.MAX_STACKED_MODALS}.`
        );
        return;
      }

      if (!allowStacking && openModalCount > 0) {
        console.warn(
          `Opening modal "${id}" will close all other modals because stacking is disabled.`
        );
      }

      setModals((prev) => ({
        ...(allowStacking ? prev : {}),
        [id]: true,
      }));

      logDebug('Modal state after opening', modals);
    },
    [modals]
  );

  const closeModalInstance = useCallback(
    (id: string) => {
      if (!registeredModals.has(id)) {
        console.error(`Modal "${id}" is not registered or currently open.`);
        return;
      }

      setModals((prev) => ({ ...prev, [id]: false }));

      logDebug('Modal state after closing', modals);
    },
    [registeredModals]
  );

  const registerModal = useCallback(
    (id: string) => {
      setRegisteredModals((prev) => {
        const updated = new Set(prev).add(id);
        if (pendingOpens.has(id)) {
          pendingOpens.delete(id);
          setModals((prevModals) => ({ ...prevModals, [id]: true }));
        }
        logDebug('Registered modals', updated);
        return updated;
      });
    },
    [pendingOpens]
  );

  const unregisterModal = useCallback((id: string) => {
    setRegisteredModals((prev) => {
      const updated = new Set(prev);
      updated.delete(id);
      return updated;
    });

    setModals((prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
    logDebug('Unregistered modals', registeredModals);
  }, []);

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
