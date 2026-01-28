import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageHeader } from './PageHeader';

describe('PageHeader', () => {
  describe('title', () => {
    it('renders the title', () => {
      render(<PageHeader title="Test Title" />);
      expect(screen.getByRole('heading', { name: 'Test Title' })).toBeInTheDocument();
    });

    it('renders the title with display font styling', () => {
      render(<PageHeader title="Schedule" />);
      const heading = screen.getByRole('heading', { name: 'Schedule' });
      expect(heading).toHaveClass('font-display');
    });
  });

  describe('subtitle', () => {
    it('renders subtitle when provided', () => {
      render(<PageHeader title="Title" subtitle="A helpful subtitle" />);
      expect(screen.getByText('A helpful subtitle')).toBeInTheDocument();
    });

    it('does not render subtitle when not provided', () => {
      render(<PageHeader title="Title" />);
      // Only heading and back link should be present, no subtitle
      expect(screen.queryByText(/subtitle/i)).not.toBeInTheDocument();
    });
  });

  describe('back button', () => {
    it('shows back button by default', () => {
      render(<PageHeader title="Title" />);
      expect(screen.getByLabelText('Back to home')).toBeInTheDocument();
    });

    it('hides back button when showBack is false', () => {
      render(<PageHeader title="Title" showBack={false} />);
      expect(screen.queryByLabelText('Back to home')).not.toBeInTheDocument();
    });

    it('links to home by default', () => {
      render(<PageHeader title="Title" />);
      const backLink = screen.getByLabelText('Back to home');
      expect(backLink).toHaveAttribute('href', '/');
    });

    it('uses custom backHref when provided', () => {
      render(<PageHeader title="Title" backHref="/schedule" />);
      const backLink = screen.getByLabelText('Back to home');
      expect(backLink).toHaveAttribute('href', '/schedule');
    });
  });

  describe('rightAction', () => {
    it('renders right action when provided', () => {
      render(
        <PageHeader
          title="Title"
          rightAction={<button>Action</button>}
        />
      );
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    });

    it('does not render right action section when not provided', () => {
      render(<PageHeader title="Title" />);
      // Should have spacer div instead of button
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('children', () => {
    it('renders children when provided', () => {
      render(
        <PageHeader title="Title">
          <div data-testid="child-content">Custom Content</div>
        </PageHeader>
      );
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      expect(screen.getByText('Custom Content')).toBeInTheDocument();
    });

    it('does not render children container when no children', () => {
      const { container } = render(<PageHeader title="Title" />);
      // Header should only have the nav row, no additional content
      const header = container.querySelector('header');
      expect(header?.children.length).toBe(1); // Just the flex row
    });
  });

  describe('styling', () => {
    it('has sticky positioning', () => {
      const { container } = render(<PageHeader title="Title" />);
      const header = container.querySelector('header');
      expect(header).toHaveClass('sticky');
      expect(header).toHaveClass('top-0');
    });

    it('has z-index for layering', () => {
      const { container } = render(<PageHeader title="Title" />);
      const header = container.querySelector('header');
      expect(header).toHaveClass('z-10');
    });

    it('has backdrop blur for modern effect', () => {
      const { container } = render(<PageHeader title="Title" />);
      const header = container.querySelector('header');
      expect(header).toHaveClass('backdrop-blur-sm');
    });
  });
});
