import '@testing-library/jest-dom';
import { render as rtlRender } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Providers } from '@/contexts';
import { ReactNode, AwaitedReactNode, JSX } from 'react';

expect.extend(toHaveNoViolations);

let originalWarn: typeof console.warn;
let originalDebug: typeof console.debug;

beforeAll(() => {
  // Stop warns and debugs from cluttering the test output
  originalWarn = console.warn;
  originalDebug = console.debug;
  console.warn = jest.fn();
  console.debug = jest.fn();
});

afterAll(() => {
  console.warn = originalWarn;
  console.debug = originalDebug;
});

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
