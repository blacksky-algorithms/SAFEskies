import React from 'react';
import { render, screen, axe, cleanup } from '@/setupTests';
import { Button } from '@/components/button';
import { VisualIntent } from '@/enums/styles';

describe('Button Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders a primary button by default', () => {
    render(<Button>Click Me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toHaveClass('bg-app-primary');
  });

  it('renders a primary variant button', () => {
    render(<Button variant={VisualIntent.Primary}>Test</Button>);
    const button = screen.getByRole('button', { name: /test/i });
    expect(button).toHaveClass('bg-app-primary');
  });

  it('renders an error variant button', () => {
    render(<Button variant={VisualIntent.Error}>Test</Button>);
    const button = screen.getByRole('button', { name: /test/i });
    expect(button).toHaveClass('bg-app-error');
  });

  it('renders an info variant button', () => {
    render(<Button variant={VisualIntent.Info}>Test</Button>);
    const button = screen.getByRole('button', { name: /test/i });
    expect(button).toHaveClass('bg-app-info');
  });

  it('disables the button when disabled', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button', { name: /disabled/i });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50 cursor-not-allowed');
  });

  it('shows loading spinner when submitting', () => {
    render(<Button submitting>Loading...</Button>);

    // Check the role="status" for the spinner
    const loader = screen.getByRole('status');
    expect(loader).toBeInTheDocument();

    // Verify the visible "Loading..." text
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Ensure the button is disabled
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('passes accessibility checks', async () => {
    const { container } = render(<Button>Accessible</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
