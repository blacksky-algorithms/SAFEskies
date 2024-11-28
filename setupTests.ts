import '@testing-library/jest-dom';
import { render as rtlRender } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Providers } from '@/contexts';
import { ReactNode, AwaitedReactNode, JSX } from 'react';
expect.extend(toHaveNoViolations);

const render = (
  ui:
    | string
    | number
    | bigint
    | boolean
    | Iterable<ReactNode>
    | Promise<AwaitedReactNode>
    | JSX.Element
    | null
    | undefined,
  { ...renderOptions } = {}
) => {
  return rtlRender(ui, { wrapper: Providers, ...renderOptions });
};

// re-export everything
export * from '@testing-library/react';
// override render method
export { render, axe, toHaveNoViolations };
