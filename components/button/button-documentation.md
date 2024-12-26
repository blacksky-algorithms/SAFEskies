# Components Documentation: Button and IconButton

This document outlines the purpose, implementation details, and usage examples for the `Button` and `IconButton` components in this project. It also includes guidelines for extending or creating new components and maintaining consistency across the design system.

---

## Table of Contents

1. [Button Component](#button-component)
2. [IconButton Component](#iconbutton-component)
3. [Extending the Components](#extending-the-components)
4. [Design and Accessibility Guidelines](#design-and-accessibility-guidelines)

---

## Button Component

### Overview

The `Button` component is a reusable, theme-aware button that supports multiple variants, states, and accessibility features.

### Features

- **Variants:** Supports multiple visual intents such as `primary`, `secondary`, `error`, `info`, `success`, and `text-button`.
- **States:** Handles `disabled`, `submitting`, and hover/focus states.
- **Loading State:** Displays a loading spinner when the `submitting` state is active.
- **Accessibility:** Supports ARIA attributes like `aria-busy` for loading and `disabled` for non-interactable buttons.

### Props

| Prop         | Type              | Default                | Description                              |
| ------------ | ----------------- | ---------------------- | ---------------------------------------- |
| `intent`     | `VisualIntent`    | `VisualIntent.Primary` | Defines the visual intent of the button. |
| `children`   | `React.ReactNode` | —                      | The button content.                      |
| `noPadding`  | `boolean`         | `false`                | Removes default padding if `true`.       |
| `submitting` | `boolean`         | `false`                | Displays a loading spinner.              |
| `disabled`   | `boolean`         | `false`                | Disables the button interaction.         |

### Usage Examples

#### Primary Button

```tsx
<Button intent={VisualIntent.Primary}>Submit</Button>
```

#### Error Button with Loading State

```tsx
<Button intent={VisualIntent.Error} submitting>
  Saving...
</Button>
```

#### Text Button

```tsx
<Button intent={VisualIntent.TextButton}>Cancel</Button>
```

---

## IconButton Component

### Overview

The `IconButton` component combines the `Button` and `Icon` components to create buttons with icons. It supports icon-only buttons and buttons with text alongside an icon.

### Features

- **Flexible Layout:** Place the icon on the `left` or `right` of the text.
- **Icon-Only Support:** Renders a button with just an icon.
- **Variants and States:** Fully supports all `VisualIntent` variants and states (`disabled`, `submitting`).

### Props

| Prop           | Type                  | Default                | Description                            |
| -------------- | --------------------- | ---------------------- | -------------------------------------- |
| `icon`         | `IconProps['icon']`   | —                      | The icon to render.                    |
| `iconPosition` | `'left'` \| `'right'` | `'left'`               | Position of the icon relative to text. |
| `intent`       | `VisualIntent`        | `VisualIntent.Primary` | Visual intent for the button.          |
| `text`         | `string`              | —                      | The button text (optional).            |
| `noPadding`    | `boolean`             | `false`                | Removes default padding if `true`.     |
| `submitting`   | `boolean`             | `false`                | Displays a loading spinner.            |
| `disabled`     | `boolean`             | `false`                | Disables the button interaction.       |

### Usage Examples

#### Icon-Only Button

```tsx
<IconButton icon='PlusIcon' aria-label='Add' />
```

#### Icon with Text

```tsx
<IconButton
  icon='CheckIcon'
  text='Confirm'
  intent={VisualIntent.Success}
  iconPosition='left'
/>
```

#### Submitting State

```tsx
<IconButton icon='loader' text='Saving' intent={VisualIntent.Info} submitting />
```

---

## Extending the Components

### When to Create a New Variant

Create a new variant only if:

1. It aligns with a clear design purpose (e.g., `warning`, `neutral`).
2. It provides unique visual feedback that cannot be achieved with existing variants.

To add a new variant:

1. Update the `VisualIntent` enum in `styles.ts`:

   ```ts
   export enum VisualIntent {
     Primary = 'primary',
     Secondary = 'secondary',
     Error = 'error',
     Info = 'info',
     Success = 'success',
     Warning = 'warning',
   }
   ```

2. Add the corresponding styles in `tailwind.config.js` under `theme.extend.colors`.

3. Update the `variantClasses` maps in the `Button` and `IconButton` components.

---

## Design and Accessibility Guidelines

1. **Accessibility:**

   - Always provide `aria-label` for icon-only buttons.
   - Use `aria-busy` when buttons are in a loading state.
   - Disable buttons when actions are unavailable and provide visual cues (e.g., `opacity-50`).

2. **Consistency:**

   - Use `VisualIntent` to define visual styles across components.
   - Use predefined sizes (`sm`, `md`, `lg`, `xl`) for icons to ensure consistency.

3. **State Management:**

   - Use `submitting` for loading states instead of changing button text manually.
   - Combine `disabled` and `submitting` to prevent interaction during processing.

4. **Design Tokens:**
   - Ensure all colors and variants align with the theme defined in `tailwind.config.js`.

---

## Contributing

If you want to contribute or improve these components:

1. Open an issue describing the change or bug.
2. Follow the coding style and conventions in this project.
3. Write tests to ensure consistent behavior across variants and states.

We welcome contributions that improve usability, accessibility, or consistency across the design system!

---

## Final Notes

The `Button` and `IconButton` components are designed to be reusable, accessible, and easy to extend. Follow the guidelines provided here to maintain consistency and usability across the project.

For any questions or discussions, open an issue or start a discussion in our repository.

---
