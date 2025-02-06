# Modal and ModalProvider Documentation

## **ModalProvider Context**

The **`ModalProvider`** creates a React context for managing modals in an application. It provides a mechanism for opening, closing, and managing modal stacking.

### **Integration**

The entire app layout is wrapped in the **`ModalProvider`** to ensure modals can be managed globally.

---

### **API**

#### **Context Functions**

| Function             | Parameters                              | Returns   | Description                                                                                       |
| -------------------- | --------------------------------------- | --------- | ------------------------------------------------------------------------------------------------- |
| `isOpen`             | `id: string`                            | `boolean` | Checks if the modal with the given ID is currently open.                                          |
| `openModalInstance`  | `id: string`, `allowStacking?: boolean` | `void`    | Opens the modal with the specified ID. If `allowStacking` is `true`, the modal can stack.         |
| `closeModalInstance` | `id: string`                            | `void`    | Closes the modal with the specified ID.                                                           |
| `registerModal`      | `id: string`                            | `void`    | Registers a modal with the specified ID. Must be called before attempting to open the modal.      |
| `unregisterModal`    | `id: string`                            | `void`    | Unregisters the modal with the specified ID. Automatically cleans up when the modal is unmounted. |

---

### **Usage Example**

**Wrap your application in `ModalProvider`:**

```tsx
import React from 'react';
import { ModalProvider } from '@/contexts/modal-context';

function App() {
  return (
    <ModalProvider>
      <YourApp />
    </ModalProvider>
  );
}

export default App;
```

**Access modal management functions using `useModal`:**

```tsx
import React from 'react';
import { useModal } from '@/contexts/modal-context';

const TestComponent = () => {
  const { openModalInstance, closeModalInstance } = useModal();

  return (
    <div>
      <button onClick={() => openModalInstance('example-modal')}>
        Open Modal
      </button>
      <button onClick={() => closeModalInstance('example-modal')}>
        Close Modal
      </button>
    </div>
  );
};
```

---

## **Modal Component**

The **`Modal`** component represents a UI modal dialog. It integrates with the **`ModalProvider`** context and supports features such as modal stacking, sizes, and accessibility.

### **Props**

| Prop        | Type              | Required | Default    | Description                                                                                 |
| ----------- | ----------------- | -------- | ---------- | ------------------------------------------------------------------------------------------- | --- | ---------- | ------------------------------------------------------------------------------------------ |
| `id`        | `string`          | ✅       | —          | Unique identifier for the modal. Used to manage modal state in the `ModalProvider` context. |
| `title`     | `string`          | ✅       | —          | Title displayed at the top of the modal. Used for accessibility (`aria-labelledby`).        |
| `children`  | `React.ReactNode` | ✅       | —          | Content to render inside the modal.                                                         |
| `size`      | `'small'          | 'medium' | 'large'    | 'full'`                                                                                     | ❌  | `'medium'` | Specifies the modal size. Supports `small`, `medium`, `large`, and `full` for full-screen. |
| `className` | `string`          | ❌       | `''`       | Custom class names applied to the modal wrapper.                                            |
| `onClose`   | `() => void`      | ❌       | `() => {}` | Callback invoked when the modal is closed.                                                  |

---

### **Modal Size Variants**

| Size     | Class Names                                                 |
| -------- | ----------------------------------------------------------- |
| `small`  | `max-w-sm`                                                  |
| `medium` | `max-w-md`                                                  |
| `large`  | `max-w-2xl`                                                 |
| `full`   | `w-full h-full max-h-screen w-screen h-screen rounded-none` |

---

### **Accessibility**

- The **`Modal`** component uses `role="dialog"` and `aria-modal="true"` for accessibility.
- The **`title`** prop is tied to the `aria-labelledby` attribute.
- Focus management is handled automatically using Headless UI's **`Dialog`** component.

---

### **Usage Example**

```tsx
import React from 'react';
import { Modal } from '@/components/modals';
import { useModal } from '@/contexts/modal-context';

const ExampleModal = () => {
  const { openModalInstance, closeModalInstance } = useModal();

  return (
    <>
      <button onClick={() => openModalInstance('example-modal')}>
        Open Example Modal
      </button>

      <Modal id='example-modal' title='Example Modal' size='medium'>
        <p>This is a sample modal dialog.</p>
        <button onClick={() => closeModalInstance('example-modal')}>
          Close Modal
        </button>
      </Modal>
    </>
  );
};
```

---

### **Full-Screen Modal**

The **`size="full"`** prop ensures the modal occupies the full viewport.

```tsx
<Modal id='full-screen-modal' title='Full-screen Modal' size='full'>
  <p>This modal takes up the entire screen.</p>
</Modal>
```

Rendered DOM structure:

```html
<div
  class="fixed inset-0 flex items-center justify-center p-4 h-screen w-screen"
>
  <div class="w-full h-full max-h-screen w-screen h-screen rounded-none">
    <!-- Modal content -->
  </div>
</div>
```

---

### **Integration with ModalProvider**

Ensure all modals are wrapped inside a `ModalProvider`:

```tsx
<ModalProvider>
  <Modal id='example-modal' title='Example Modal'>
    <p>Modal Content</p>
  </Modal>
</ModalProvider>
```

---

### **Testing**

Testing is simplified with accessibility in mind:

1. Use **`getByRole('dialog')`** to find modals.
2. Verify modal content with **`getByText`**.
3. Use **`axe`** for accessibility validation.

**Example Test Case:**

```tsx
import { render, screen, act, waitFor } from '@/test/setupTests';
import { Modal } from '@/components/modals';
import { ModalProvider } from '@/contexts/modal-context';

describe('Modal', () => {
  it('renders a full-screen modal correctly', async () => {
    render(
      <ModalProvider>
        <Modal id='full-screen-modal' title='Full-screen Modal' size='full'>
          <p>Full-screen modal content</p>
        </Modal>
      </ModalProvider>
    );

    act(() => {
      screen.getByText('Open Full-screen Modal').click();
    });

    await waitFor(() => {
      const dialog = screen.getByRole('dialog', { hidden: true });
      expect(dialog).toHaveClass('w-screen h-screen');
      expect(screen.getByText('Full-screen modal content')).toBeInTheDocument();
    });
  });
});
```
