import React from 'react';
import { render, act, waitFor } from '@/setupTests';
import { useModal } from '@/contexts/modal-context';
import { Modal } from '@/components/modals';

const TestComponent = () => {
  const { openModalInstance, closeModalInstance } = useModal();

  return (
    <div>
      <button onClick={() => openModalInstance('test-modal')}>
        Open Modal (No Stack)
      </button>
      <button onClick={() => closeModalInstance('test-modal')}>
        Close Modal (No Stack)
      </button>
      <button onClick={() => openModalInstance('modal-1', true)}>
        Open Modal 1 (Stack)
      </button>
      <button onClick={() => openModalInstance('modal-2', true)}>
        Open Modal 2 (Stack)
      </button>
      <button onClick={() => openModalInstance('modal-3', true)}>
        Open Modal 3 (Stack)
      </button>
      <button onClick={() => openModalInstance('modal-4', true)}>
        Open Modal 4 (Stack)
      </button>
      <button onClick={() => closeModalInstance('modal-1')}>
        Close Modal 1
      </button>
      <button onClick={() => closeModalInstance('modal-2')}>
        Close Modal 2
      </button>
      <button onClick={() => closeModalInstance('modal-3')}>
        Close Modal 3
      </button>
      <button onClick={() => closeModalInstance('modal-4')}>
        Close Modal 4
      </button>
    </div>
  );
};

describe('ModalProvider and Modal Integration', () => {
  let originalWarn: typeof console.warn;

  beforeAll(() => {
    // Stop warns from cluttering the test output
    originalWarn = console.warn;
    console.warn = jest.fn();
  });

  afterAll(() => {
    // Clean up
    console.warn = originalWarn;
  });
  it('should open a registered modal', async () => {
    const { getByText } = render(
      <>
        <Modal id='test-modal' title='Test Modal'>
          <p>Modal is open</p>
        </Modal>
        <TestComponent />
      </>
    );

    act(() => {
      getByText('Open Modal (No Stack)').click();
    });

    await waitFor(() => {
      expect(getByText('Modal is open')).toBeInTheDocument();
    });
  });

  it('should close an open modal', async () => {
    const { getByText } = render(
      <>
        <Modal id='test-modal' title='Test Modal'>
          <p>Modal is open</p>
        </Modal>
        <TestComponent />
      </>
    );

    act(() => {
      getByText('Open Modal (No Stack)').click();
    });

    await waitFor(() => {
      expect(getByText('Modal is open')).toBeInTheDocument();
    });

    act(() => {
      getByText('Close Modal (No Stack)').click();
    });

    await waitFor(() => {
      expect(() => getByText('Modal is open')).toThrow();
    });
  });

  it('should handle stacking modals correctly', async () => {
    const { getByText } = render(
      <>
        <Modal id='modal-1' title='Modal 1'>
          <p>Modal 1 is open</p>
        </Modal>
        <Modal id='modal-2' title='Modal 2'>
          <p>Modal 2 is open</p>
        </Modal>
        <TestComponent />
      </>
    );

    // Open modal-1 with stacking enabled
    act(() => {
      getByText('Open Modal 1 (Stack)').click();
    });

    await waitFor(() => {
      expect(getByText('Modal 1 is open')).toBeInTheDocument();
    });

    // Open modal-2 with stacking enabled
    act(() => {
      getByText('Open Modal 2 (Stack)').click();
    });

    await waitFor(() => {
      expect(getByText('Modal 2 is open')).toBeInTheDocument();
    });
  });

  it('should respect max stacked modal limit', async () => {
    const { getByText } = render(
      <>
        <Modal id='modal-1' title='Modal 1'>
          <p>Modal 1 is open</p>
        </Modal>
        <Modal id='modal-2' title='Modal 2'>
          <p>Modal 2 is open</p>
        </Modal>
        <Modal id='modal-3' title='Modal 3'>
          <p>Modal 3 is open</p>
        </Modal>
        <Modal id='modal-4' title='Modal 4'>
          <p>Modal 4 is open</p>
        </Modal>
        <TestComponent />
      </>
    );

    // Open modals 1, 2, and 3 with stacking enabled
    act(() => {
      getByText('Open Modal 1 (Stack)').click(); // Open modal-1
    });

    act(() => {
      getByText('Open Modal 2 (Stack)').click(); // Open modal-2
    });

    act(() => {
      getByText('Open Modal 3 (Stack)').click(); // Open modal-3
    });

    // Attempt to open modal-4, which exceeds the stacking limit
    act(() => {
      getByText('Open Modal 4 (Stack)').click(); // Open modal-4
    });

    // Verify that modal-4 was not opened
    await waitFor(() => {
      expect(() => getByText('Modal 4 is open')).toThrow();
    });
  });

  it('should close one modal without affecting others in stack', async () => {
    const { getByText } = render(
      <>
        <Modal id='modal-1' title='Modal 1'>
          <p>Modal 1 is open</p>
        </Modal>
        <Modal id='modal-2' title='Modal 2'>
          <p>Modal 2 is open</p>
        </Modal>
        <TestComponent />
      </>
    );

    // Open modal-1 and modal-2 with stacking enabled
    act(() => {
      getByText('Open Modal 1 (Stack)').click();
    });

    act(() => {
      getByText('Open Modal 2 (Stack)').click();
    });

    await waitFor(() => {
      expect(getByText('Modal 1 is open')).toBeInTheDocument();
      expect(getByText('Modal 2 is open')).toBeInTheDocument();
    });

    // Close modal-1
    act(() => {
      getByText('Close Modal 1').click();
    });

    await waitFor(() => {
      expect(() => getByText('Modal 1 is open')).toThrow();
      expect(getByText('Modal 2 is open')).toBeInTheDocument();
    });
  });
  it('should not stack a non-stackable modal', async () => {
    const { getByText } = render(
      <>
        <Modal id='modal-1' title='Modal 1'>
          <p>Modal 1 is open</p>
        </Modal>
        <Modal id='test-modal' title='Modal (No Stack)'>
          <p>Modal (No Stack) is open</p>
        </Modal>
        <TestComponent />
      </>
    );

    // Open stackable modal-1
    act(() => {
      getByText('Open Modal 1 (Stack)').click();
    });

    await waitFor(() => {
      expect(getByText('Modal 1 is open')).toBeInTheDocument();
    });

    // Open non-stackable modal-4
    act(() => {
      getByText('Open Modal (No Stack)').click();
    });

    await waitFor(() => {
      expect(getByText('Modal (No Stack)')).toBeInTheDocument();
      expect(() => getByText('Modal 1 is open')).toThrow(); // Modal 1 should not be visible
    });

    // Close modal-4
    act(() => {
      getByText('Close Modal (No Stack)').click();
    });

    await waitFor(() => {
      expect(() => getByText('Modal (No Stack)')).toThrow(); // Modal 4 should be closed
      expect(() => getByText('Modal 1 is open')).toThrow(); // Modal 1 should not reappear
    });
  });

  it('should respect non-stackable modal behavior in a stack list', async () => {
    const { getByText } = render(
      <>
        <Modal id='modal-1' title='Modal 1'>
          <p>Modal 1 is open</p>
        </Modal>
        <Modal id='modal-2' title='Modal 2'>
          <p>Modal 2 is open</p>
        </Modal>
        <Modal id='test-modal' title='Modal (No Stack)'>
          <p>Modal (No Stack) is open</p>
        </Modal>

        <TestComponent />
      </>
    );

    // Open stackable modals
    act(() => {
      getByText('Open Modal 1 (Stack)').click();
    });

    act(() => {
      getByText('Open Modal 2 (Stack)').click();
    });

    await waitFor(() => {
      expect(getByText('Modal 1 is open')).toBeInTheDocument();
      expect(getByText('Modal 2 is open')).toBeInTheDocument();
    });

    // Open non-stackable modal-4
    act(() => {
      getByText('Open Modal (No Stack)').click();
    });

    await waitFor(() => {
      expect(getByText('Modal (No Stack) is open')).toBeInTheDocument();
      expect(() => getByText('Modal 1 is open')).toThrow(); // All other modals should be closed
      expect(() => getByText('Modal 2 is open')).toThrow();
      expect(() => getByText('Modal 3 is open')).toThrow();
    });

    // Close modal-4
    act(() => {
      getByText('Close Modal (No Stack)').click();
    });

    await waitFor(() => {
      expect(() => getByText('Modal (No Stack) is open')).toThrow(); // Modal 4 should be closed
      expect(() => getByText('Modal 1 is open')).toThrow(); // Other modals should not reappear
      expect(() => getByText('Modal 2 is open')).toThrow();
      expect(() => getByText('Modal 3 is open')).toThrow();
    });
  });
});
