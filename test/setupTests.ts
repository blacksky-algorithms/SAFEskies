import '@testing-library/jest-dom';
import { render as rtlRender } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Providers } from '@/contexts';
import { ReactNode, AwaitedReactNode, JSX } from 'react';
import { QueryClient } from '@tanstack/react-query';
import {
  renderHook as rtlRenderHook,
  act as rtlAct,
} from '@testing-library/react';

expect.extend(toHaveNoViolations);

let originalWarn: typeof console.warn;

beforeAll(() => {
  // Suppress warnings and debug messages during tests.
  originalWarn = console.warn;
  console.warn = jest.fn();
});

afterAll(() => {
  console.warn = originalWarn;
});

/**
 * Custom render function that wraps the UI in our Providers.
 */
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
) => rtlRender(ui, { wrapper: Providers, ...renderOptions });

/**
 * createQueryClient - Returns a new QueryClient with caching disabled for each test.
 */
const createQueryClient = () => new QueryClient();

// Export our testing utilities.
export {
  render,
  axe,
  toHaveNoViolations,
  rtlRenderHook as renderHook,
  rtlAct as act,
  createQueryClient,
};

// Re-export everything else from @testing-library/react.
export * from '@testing-library/react';
