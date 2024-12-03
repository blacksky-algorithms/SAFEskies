# Modal Usage Documentation

## Overview

This document describes how to use the **Modal** component and the accompanying `ModalContext` in the application. The modal implementation provides a robust and reusable solution for managing modal dialogs with support for stacking, registration, and customizable sizes.

---

## Table of Contents

1. [Setup](#setup)
2. [Creating a Modal](#creating-a-modal)
3. [Opening and Closing Modals](#opening-and-closing-modals)
4. [Modal Sizing](#modal-sizing)
5. [Stacked Modals](#stacked-modals)
6. [Debugging and Configuration](#debugging-and-configuration)

---

## Setup

### Step 1: Wrap the App with `ModalProvider`

To enable modal functionality, ensure that the root component or a parent component wraps the application with the `ModalProvider` (This provider is wrapping the public-layout so there should be no need to worry about this step.):

```tsx
import { ModalProvider } from '@/contexts/modal-context';

function App() {
  return <ModalProvider>{/* Your application components */}</ModalProvider>;
}
```

---

## Creating a Modal

### Step 1: Use the `Modal` Component

Define a modal instance by using the `Modal` component. Each modal must have a unique `id` and can include a `title`, `size`, and `className`. New `id`s should be added to the `MODAL_INSTANCE_IDS` enum.

Example:

```tsx
import { Modal } from '@/components/modal';
import { MODAL_INSTANCE_IDS } from '@/enums/modals';

const MyModal = () => (
  <Modal id={MODAL_INSTANCE_IDS.EXAMPLE} title='My Modal Title'>
    <p>This is the content of the modal.</p>
  </Modal>
);
```

### Step 2: Register the Modal

The `Modal` component automatically registers itself on mount and unregisters on unmount. You don’t need to call `registerModal` or `unregisterModal` manually.

---

## Opening and Closing Modals

### Open a Modal

Use the `openModalInstance` function from the `useModal` hook to open a modal:

```tsx
import { useModal } from '@/contexts/modal-context';
import { MODAL_INSTANCE_IDS } from '@/enums/modals';

const Example = () => {
  const { openModalInstance } = useModal();

  return (
    <button onClick={() => openModalInstance(MODAL_INSTANCE_IDS.EXAMPLE)}>
      Open Modal
    </button>
  );
};
```

### Close a Modal

The `Modal` component includes a built-in close button. To programmatically close a modal, use the `closeModalInstance` function:

The `Modal` also accepts an `onClose` prop to allow for additional actions to be taken when the modal is closed. TODO: refactor to allow `closeModalInstance` to accept an optional callback, this will be much more ergonomic.

```tsx
const { closeModalInstance } = useModal();

closeModalInstance(MODAL_INSTANCE_IDS.EXAMPLE);
```

---

## Modal Sizing

The `Modal` component supports customizable sizes. Pass the `size` prop to adjust the modal width. Available sizes:

- `small`: Small width (`max-w-sm`).
- `medium`: Default width (`max-w-md`).
- `large`: Large width (`max-w-2xl`).
- `full`: Full-screen modal (`w-full h-full`).

Example:

```tsx
<Modal id='large-modal' title='Large Modal' size='large'>
  <p>This modal has a large width.</p>
</Modal>
```

---

## Stacked Modals

### Enabling Stacking

To enable multiple stacked modals, pass `allowStacking = true` to `openModalInstance`. The number of stacked modals is limited by `MODAL_CONFIG.MAX_STACKED_MODALS`.

Example:

```tsx
openModalInstance('modal-id', true); // Allow stacking
```

### Stacking Limit

By default, the maximum stacked modals are limited to `3`. Adjust the limit via the `NEXT_PUBLIC_MAX_STACKED_MODALS` environment variable.

---

## Debugging and Configuration

### Debugging

Enable debug logging for modals by setting `MODAL_CONFIG.ENABLE_DEBUG = true`.

Logs will include:

- Modal registration/unregistration.
- Opening and closing actions.
- Validation errors.

### Configuration

The following environment variables control modal behavior:

- `NEXT_PUBLIC_MAX_STACKED_MODALS`: Set the maximum number of stacked modals (default: 3).

---

## Notes

- Each modal must have a **unique `id`**.
- Ensure modals are registered before attempting to open them.
