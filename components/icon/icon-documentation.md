# Components Documentation: Icon

This document outlines the purpose, implementation details, and usage examples for the `Icon` component in this project. It also includes guidelines for extending or creating new icons and maintaining consistency across the design system.

---

## Table of Contents

1. [Icon Component](#icon-component)
2. [Extending the Icon Component](#extending-the-icon-component)
3. [Design and Accessibility Guidelines](#design-and-accessibility-guidelines)

---

## Icon Component

### Overview

The `Icon` component renders **HeroIcons** or a custom `loader` spinner. It supports dynamic sizing and theming based on variants.

### Features

- **Variants:** Supports `primary`, `secondary`, `error`, `info`, and `success`.
- **Sizes:** `sm`, `md`, `lg`, and `xl` sizes.
- **Custom Loader:** A built-in spinning loader icon.
- **Theming:** Automatically applies theme-aware colors.

### Props

| Prop       | Type                                             | Default                | Description                         |
| ---------- | ------------------------------------------------ | ---------------------- | ----------------------------------- |
| `icon`     | `keyof typeof HeroIcons` \| `'loader'`           | —                      | The icon to render or a `loader`.   |
| `variant`  | `Exclude<VisualIntent, VisualIntent.TextButton>` | `VisualIntent.Primary` | The visual intent for the icon.     |
| `size`     | `sm` \| `md` \| `lg` \| `xl`                     | `md`                   | Sets the icon size.                 |
| `isButton` | `boolean`                                        | `false`                | Makes the icon fill a button space. |

### Usage Examples

#### Default Icon

```tsx
<Icon icon='CheckIcon' variant={VisualIntent.Success} size='lg' />
```

#### Loading Spinner

```tsx
<Icon icon='loader' variant={VisualIntent.Info} size='xl' />
```

---

## Extending the Icon Component

### When to Add a New Icon

Add a new icon if:

1. It aligns with a clear design purpose (e.g., a unique visual indicator not provided by HeroIcons).
2. It enhances the user experience or provides clarity in a specific context.

### Adding a Custom Icon

1. Add the custom SVG to the `icons` directory.
2. Import the SVG into the `Icon` component.
3. Extend the `icon` prop typing to include the new icon:

   ```ts
   export interface IconProps extends React.HTMLAttributes<SVGElement> {
     icon: keyof typeof HeroIcons | 'loader' | 'CustomIcon';
   }
   ```

4. Update the `Icon` rendering logic to handle the new custom icon.

---

## Design and Accessibility Guidelines

1. **Accessibility:**

   - Always provide an appropriate `aria-label` for icons used as interactive elements.
   - Ensure `loader` icons are accompanied by relevant ARIA attributes (e.g., `aria-busy`).

2. **Consistency:**

   - Use the `VisualIntent` enum to define styles for all icons.
   - Ensure icons adhere to predefined sizes (`sm`, `md`, `lg`, `xl`).

3. **State Management:**

   - Use `variant` to apply theme-aware colors dynamically.
   - Ensure interactive icons (e.g., those in buttons) reflect states like `hover` and `focus` through the parent component.

4. **Design Tokens:**
   - Ensure all icon colors align with the theme defined in `tailwind.config.js`.

---

## Contributing

If you want to contribute or improve the `Icon` component:

1. Open an issue describing the change or bug.
2. Follow the coding style and conventions in this project.
3. Write tests to ensure consistent behavior across variants and sizes.

We welcome contributions that improve usability, accessibility, or consistency across the design system!

---

## Final Notes

The `Icon` component is designed to be reusable, accessible, and easy to extend. Follow the guidelines provided here to maintain consistency and usability across the project.

For any questions or discussions, open an issue or start a discussion in our repository.

---
