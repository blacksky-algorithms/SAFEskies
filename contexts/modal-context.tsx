'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
} from 'react';

type ModalState = {
  isOpen: (id: string) => boolean;
  openModalInstance: (id: string, allowStacking?: boolean) => void;
  closeModalInstance: (id: string) => void;
  registerModal: (id: string) => void;
  unregisterModal: (id: string) => void;
};

const MODAL_CONFIG = {
  MAX_STACKED_MODALS: parseInt(
    process.env.NEXT_PUBLIC_MAX_STACKED_MODALS || '3',
    10
  ),
  ENABLE_DEBUG: false,
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

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    const maxModals = parseInt(
      process.env.NEXT_PUBLIC_MAX_STACKED_MODALS || '3',
      10
    );
    if (!isNaN(maxModals)) {
      MODAL_CONFIG.MAX_STACKED_MODALS = maxModals;
      if (MODAL_CONFIG.ENABLE_DEBUG) {
        console.debug(`Updated MAX_STACKED_MODALS to ${maxModals}`);
      }
    }

    return () => {
      isMounted.current = false;
    };
  }, []);

  const logDebug = (message: string, data?: unknown) => {
    if (MODAL_CONFIG.ENABLE_DEBUG) {
      console.debug(`[ModalContext] ${message}`, data);
    }
  };

  const isOpen = useCallback((id: string) => Boolean(modals[id]), [modals]);

  const ensureModalIsRegistered = useCallback(
    (id: string): boolean => {
      if (!registeredModals.has(id)) {
        logDebug(`Modal "${id}" is not registered.`);
        return false;
      }
      return true;
    },
    [registeredModals]
  );

  const openModalInstance = useCallback(
    (id: string, allowStacking = false) => {
      if (!ensureModalIsRegistered(id)) {
        console.warn(
          `Attempting to open unregistered modal "${id}". Ensure the modal is registered before opening it.`
        );
        return;
      }

      setModals((prev) => {
        const openModalCount = Object.values(prev).filter(Boolean).length;

        if (
          allowStacking &&
          openModalCount >= MODAL_CONFIG.MAX_STACKED_MODALS
        ) {
          console.warn(
            `Too many modals open. Maximum allowed stacked modals is ${MODAL_CONFIG.MAX_STACKED_MODALS}.`
          );
          return prev;
        }

        if (!allowStacking) {
          logDebug(`Closing other modals because stacking is disabled.`);
          return { [id]: true };
        }

        return { ...prev, [id]: true };
      });

      logDebug(`Opened modal "${id}".`, { allowStacking });
    },
    [ensureModalIsRegistered]
  );

  const closeModalInstance = useCallback(
    (id: string) => {
      if (!ensureModalIsRegistered(id)) return;

      setModals((prev) => {
        if (!prev[id]) {
          logDebug(`Modal "${id}" is already closed.`);
          return prev;
        }

        if (isMounted.current) {
          return { ...prev, [id]: false };
        }
        return prev;
      });
      logDebug(`Closed modal "${id}".`);
    },
    [ensureModalIsRegistered]
  );

  const registerModal = useCallback((id: string) => {
    setRegisteredModals((prev) => {
      if (prev.has(id)) {
        logDebug(`Modal "${id}" is already registered.`);
        return prev;
      }
      const updated = new Set(prev).add(id);
      logDebug(`Registered modal "${id}".`, Array.from(updated));
      return updated;
    });
  }, []);

  const unregisterModal = useCallback((id: string) => {
    setRegisteredModals((prev) => {
      if (!prev.has(id)) {
        logDebug(`Attempted to unregister non-registered modal "${id}".`);
        return prev;
      }
      const updated = new Set(prev);
      updated.delete(id);
      logDebug(`Unregistered modal "${id}".`);
      return updated;
    });

    setModals((prev) => {
      if (!(id in prev)) return prev;
      const { [id]: _, ...rest } = prev;
      return rest;
    });
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
