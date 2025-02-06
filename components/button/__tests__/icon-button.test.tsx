import React from 'react';
import { render, screen, axe } from '@/test/setupTests';
import { IconButton } from '../icon-button';

describe('IconButton Component', () => {
  it('renders an icon-only button with proper accessibility', () => {
    render(<IconButton icon='PlusIcon' aria-label='Add' />);
    const button = screen.getByRole('button', { name: /add/i });
    expect(button).toBeInTheDocument();
  });

  it('renders button with text and icon (left)', () => {
    render(<IconButton icon='CheckIcon' text='Confirm' />);
    const button = screen.getByRole('button', { name: /confirm/i });
    expect(button).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });

  it('renders button with text and icon (right)', () => {
    render(<IconButton icon='CheckIcon' text='Confirm' iconPosition='right' />);
    const button = screen.getByRole('button', { name: /confirm/i });
    expect(button).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });

  it('shows a loader when submitting', () => {
    render(<IconButton icon='CheckIcon' text='Loading...' submitting />);
    const button = screen.getByRole('button', { name: /loading.../i });
    expect(button).toBeDisabled();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    const loader = screen.getByRole('status'); // Role from LoadingSpinner
    expect(loader).toBeInTheDocument();
  });

  it('disables the button when in a submitting state', () => {
    render(<IconButton icon='CheckIcon' text='Submitting' submitting />);
    const button = screen.getByRole('button', { name: /loading.../i });
    expect(button).toBeDisabled();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders the icon only and respects aria-label when no text is provided', () => {
    render(<IconButton icon='CheckIcon' aria-label='Icon Only' />);
    const button = screen.getByRole('button', { name: /icon only/i });
    expect(button).toBeInTheDocument();
  });

  it('passes accessibility checks', async () => {
    const { container } = render(
      <IconButton icon='CheckIcon' aria-label='Accessible IconButton' />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
