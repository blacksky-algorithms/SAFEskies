import React from 'react';
import { render, screen, axe } from '@/test/setupTests';
import { Icon } from '@/components/icon';
import { VisualIntent, SharedSize } from '@/enums/styles';

describe('Icon Component', () => {
  it('renders a HeroIcon by name', () => {
    render(<Icon icon='CheckIcon' aria-label='Check Icon' />);
    const icon = screen.getByLabelText('Check Icon');
    expect(icon).toBeInTheDocument();
  });

  it('renders the loader icon with animation', () => {
    render(<Icon icon='loader' aria-label='Loading...' />);

    // Loader uses role="status" for accessibility
    const loader = screen.getByRole('status', { name: /loading.../i });
    expect(loader).toBeInTheDocument();

    const spinner = loader.querySelector('svg');
    expect(spinner).toHaveClass('animate-spin');
  });

  it('applies the correct size classes', () => {
    render(<Icon icon='CheckIcon' size='lg' aria-label='Check Icon' />);
    const icon = screen.getByLabelText('Check Icon');
    expect(icon).toHaveClass(SharedSize.lg);
  });

  it('applies the correct variant classes', () => {
    render(
      <Icon
        icon='CheckIcon'
        intent={VisualIntent.Error}
        aria-label='Error Icon'
      />
    );
    const icon = screen.getByLabelText('Error Icon');
    expect(icon).toHaveClass('text-app-error');
  });

  it('adds a default aria-label for interactive icons', () => {
    render(<Icon icon='CheckIcon' isButton />);
    const icon = screen.getByLabelText('Check Icon');
    expect(icon).toBeInTheDocument();
  });

  it('passes accessibility checks', async () => {
    const { container } = render(
      <Icon icon='CheckIcon' aria-label='Accessible Icon' />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
