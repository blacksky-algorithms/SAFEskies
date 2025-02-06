import React from 'react';
import { render, act, waitFor, axe } from '@/test/setupTests';
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
      <button onClick={() => openModalInstance('full-screen-modal')}>
        Open Full-screen Modal
      </button>
    </div>
  );
};

describe('ModalProvider and Modal Integration', () => {
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

    act(() => {
      getByText('Open Modal 1 (Stack)').click();
    });

    await waitFor(() => {
      expect(getByText('Modal 1 is open')).toBeInTheDocument();
    });

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

    act(() => getByText('Open Modal 1 (Stack)').click());
    act(() => getByText('Open Modal 2 (Stack)').click());
    act(() => getByText('Open Modal 3 (Stack)').click());

    act(() => getByText('Open Modal 4 (Stack)').click());

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

    act(() => getByText('Open Modal 1 (Stack)').click());
    act(() => getByText('Open Modal 2 (Stack)').click());

    await waitFor(() => {
      expect(getByText('Modal 1 is open')).toBeInTheDocument();
      expect(getByText('Modal 2 is open')).toBeInTheDocument();
    });

    act(() => getByText('Close Modal 1').click());

    await waitFor(() => {
      expect(() => getByText('Modal 1 is open')).toThrow();
      expect(getByText('Modal 2 is open')).toBeInTheDocument();
    });
  });

  it('should render full-screen modal correctly', async () => {
    const { baseElement, getByText, getByRole } = render(
      <>
        <Modal id='full-screen-modal' title='Full-screen Modal' size='full'>
          <p>Full-screen modal content</p>
        </Modal>
        <TestComponent />
      </>
    );

    act(() => {
      getByText('Open Full-screen Modal').click();
    });

    await waitFor(() => {
      const dialog = getByRole('dialog', { hidden: true });
      expect(dialog).toHaveAttribute('aria-modal', 'true');

      const modalPanel = baseElement.querySelector(
        '[data-headlessui-state="open"].w-screen.h-screen'
      );

      expect(modalPanel).toBeInTheDocument();
      expect(modalPanel).toHaveClass('w-screen h-screen');

      expect(getByText('Full-screen modal content')).toBeInTheDocument();
    });
  });

  it('should pass accessibility checks for a basic modal', async () => {
    const modalText = 'Basic modal content';
    const { container, getByText } = render(
      <>
        <Modal id='test-modal' title='Basic Modal'>
          <p>{modalText}</p>
        </Modal>
        <TestComponent />
      </>
    );

    act(() => {
      getByText('Open Modal (No Stack)').click();
    });

    await waitFor(() => {
      expect(getByText(modalText)).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should pass accessibility checks for stacked modals', async () => {
    const modal1Text = 'Stacked modal 1 content';
    const modal2Text = 'Stacked modal 2 content';
    const { container, getByText } = render(
      <>
        <Modal id='modal-1' title='Stacked Modal 1'>
          <p>{modal1Text}</p>
        </Modal>
        <Modal id='modal-2' title='Stacked Modal 2'>
          <p>{modal2Text}</p>
        </Modal>
        <TestComponent />
      </>
    );

    // Open first stacked modal
    act(() => {
      getByText('Open Modal 1 (Stack)').click();
    });

    await waitFor(() => {
      expect(getByText(modal1Text)).toBeInTheDocument();
    });

    // Open second stacked modal
    act(() => {
      getByText('Open Modal 2 (Stack)').click();
    });

    await waitFor(() => {
      expect(getByText(modal2Text)).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should pass accessibility checks for a full-screen modal', async () => {
    const { container, getByText } = render(
      <>
        <Modal id='full-screen-modal' title='Full-Screen Modal' size='full'>
          <p>Full-screen modal content</p>
        </Modal>
        <TestComponent />
      </>
    );

    act(() => {
      getByText('Open Full-screen Modal').click();
    });

    await waitFor(() => {
      expect(getByText('Full-screen modal content')).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
