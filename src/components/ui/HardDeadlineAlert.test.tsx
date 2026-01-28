import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  HardDeadlineAlert,
  HardDeadlineList,
  CriticalDeadlineBanner,
} from './HardDeadlineAlert';
import type { HardDeadline } from '@/types/database';

const mockDeadline: HardDeadline = {
  time: '14:30',
  description: 'Shinkansen departure from Tokyo Station',
};

describe('HardDeadlineAlert', () => {
  describe('inline variant', () => {
    it('renders time', () => {
      render(<HardDeadlineAlert deadline={mockDeadline} variant="inline" />);
      expect(screen.getByText('14:30')).toBeInTheDocument();
    });

    it('applies inline styling', () => {
      const { container } = render(
        <HardDeadlineAlert deadline={mockDeadline} variant="inline" />
      );
      const element = container.querySelector('span');
      expect(element).toHaveClass('inline-flex');
      expect(element).toHaveClass('rounded-full');
    });

    it('applies custom className', () => {
      const { container } = render(
        <HardDeadlineAlert
          deadline={mockDeadline}
          variant="inline"
          className="my-custom-class"
        />
      );
      const element = container.querySelector('span');
      expect(element).toHaveClass('my-custom-class');
    });
  });

  describe('compact variant', () => {
    it('renders time and description', () => {
      render(<HardDeadlineAlert deadline={mockDeadline} variant="compact" />);
      expect(screen.getByText('14:30')).toBeInTheDocument();
      expect(screen.getByText('Shinkansen departure from Tokyo Station')).toBeInTheDocument();
    });

    it('applies compact styling', () => {
      const { container } = render(
        <HardDeadlineAlert deadline={mockDeadline} variant="compact" />
      );
      const element = container.querySelector('div');
      expect(element).toHaveClass('rounded-lg');
    });
  });

  describe('prominent variant (default)', () => {
    it('renders time and description', () => {
      render(<HardDeadlineAlert deadline={mockDeadline} />);
      expect(screen.getByText('14:30')).toBeInTheDocument();
      expect(screen.getByText('Shinkansen departure from Tokyo Station')).toBeInTheDocument();
    });

    it('shows "Hard Deadline" label', () => {
      render(<HardDeadlineAlert deadline={mockDeadline} />);
      expect(screen.getByText('Hard Deadline')).toBeInTheDocument();
    });

    it('uses prominent variant by default', () => {
      const { container } = render(<HardDeadlineAlert deadline={mockDeadline} />);
      const element = container.querySelector('div');
      expect(element).toHaveClass('rounded-xl');
      expect(element).toHaveClass('p-4');
    });

    it('has shadow styling', () => {
      const { container } = render(<HardDeadlineAlert deadline={mockDeadline} />);
      const element = container.querySelector('div');
      expect(element).toHaveClass('shadow-lg');
    });
  });
});

describe('HardDeadlineList', () => {
  const mockDeadlines: HardDeadline[] = [
    { time: '09:00', description: 'Temple opening' },
    { time: '14:30', description: 'Train departure' },
    { time: '18:00', description: 'Dinner reservation' },
  ];

  it('returns null for empty deadlines array', () => {
    const { container } = render(<HardDeadlineList deadlines={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders all deadlines', () => {
    render(<HardDeadlineList deadlines={mockDeadlines} />);
    expect(screen.getByText('09:00')).toBeInTheDocument();
    expect(screen.getByText('14:30')).toBeInTheDocument();
    expect(screen.getByText('18:00')).toBeInTheDocument();
  });

  it('shows count in header', () => {
    render(<HardDeadlineList deadlines={mockDeadlines} />);
    expect(screen.getByText('Time-Sensitive (3)')).toBeInTheDocument();
  });

  it('uses compact variant by default', () => {
    render(<HardDeadlineList deadlines={mockDeadlines} />);
    // Compact variant shows descriptions
    expect(screen.getByText('Temple opening')).toBeInTheDocument();
    expect(screen.getByText('Train departure')).toBeInTheDocument();
    expect(screen.getByText('Dinner reservation')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <HardDeadlineList deadlines={mockDeadlines} className="my-class" />
    );
    const element = container.firstChild;
    expect(element).toHaveClass('my-class');
  });
});

describe('CriticalDeadlineBanner', () => {
  it('renders time and description', () => {
    render(<CriticalDeadlineBanner deadline={mockDeadline} />);
    expect(screen.getByText(/14:30/)).toBeInTheDocument();
    expect(screen.getByText(/Shinkansen departure from Tokyo Station/)).toBeInTheDocument();
  });

  it('has alert role for accessibility', () => {
    render(<CriticalDeadlineBanner deadline={mockDeadline} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('shows animated clock emoji', () => {
    render(<CriticalDeadlineBanner deadline={mockDeadline} />);
    expect(screen.getByText('⏰')).toBeInTheDocument();
  });

  describe('dismiss button', () => {
    it('does not show dismiss button when onDismiss not provided', () => {
      render(<CriticalDeadlineBanner deadline={mockDeadline} />);
      expect(screen.queryByLabelText('Dismiss')).not.toBeInTheDocument();
    });

    it('shows dismiss button when onDismiss provided', () => {
      render(<CriticalDeadlineBanner deadline={mockDeadline} onDismiss={() => {}} />);
      expect(screen.getByLabelText('Dismiss')).toBeInTheDocument();
    });

    it('calls onDismiss when clicked', () => {
      const handleDismiss = vi.fn();
      render(<CriticalDeadlineBanner deadline={mockDeadline} onDismiss={handleDismiss} />);

      fireEvent.click(screen.getByLabelText('Dismiss'));
      expect(handleDismiss).toHaveBeenCalledTimes(1);
    });
  });

  it('applies custom className', () => {
    render(<CriticalDeadlineBanner deadline={mockDeadline} className="my-banner-class" />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('my-banner-class');
  });
});
