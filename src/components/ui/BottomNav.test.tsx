import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BottomNav } from './BottomNav';

// Mock usePathname
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/'),
}));

import { usePathname } from 'next/navigation';

const mockUsePathname = vi.mocked(usePathname);

describe('BottomNav', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/');
  });

  describe('rendering', () => {
    it('renders all navigation items', () => {
      render(<BottomNav />);

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Schedule')).toBeInTheDocument();
      expect(screen.getByText('Map')).toBeInTheDocument();
      expect(screen.getByText('Hotels')).toBeInTheDocument();
    });

    it('renders navigation as a nav element', () => {
      const { container } = render(<BottomNav />);
      expect(container.querySelector('nav')).toBeInTheDocument();
    });

    it('has correct links', () => {
      render(<BottomNav />);

      const homeLink = screen.getByText('Home').closest('a');
      const scheduleLink = screen.getByText('Schedule').closest('a');
      const mapLink = screen.getByText('Map').closest('a');
      const hotelsLink = screen.getByText('Hotels').closest('a');

      expect(homeLink).toHaveAttribute('href', '/');
      expect(scheduleLink).toHaveAttribute('href', '/schedule');
      expect(mapLink).toHaveAttribute('href', '/map');
      expect(hotelsLink).toHaveAttribute('href', '/reservations');
    });
  });

  describe('active state', () => {
    it('marks Home as active when on home page', () => {
      mockUsePathname.mockReturnValue('/');
      render(<BottomNav />);

      const homeLink = screen.getByText('Home').closest('a');
      expect(homeLink).toHaveClass('text-coral-700');
    });

    it('marks Schedule as active on schedule page', () => {
      mockUsePathname.mockReturnValue('/schedule');
      render(<BottomNav />);

      const scheduleLink = screen.getByText('Schedule').closest('a');
      expect(scheduleLink).toHaveClass('text-coral-700');
    });

    it('marks Schedule as active on nested schedule pages', () => {
      mockUsePathname.mockReturnValue('/schedule/day-5');
      render(<BottomNav />);

      const scheduleLink = screen.getByText('Schedule').closest('a');
      expect(scheduleLink).toHaveClass('text-coral-700');
    });

    it('marks Map as active on map page', () => {
      mockUsePathname.mockReturnValue('/map');
      render(<BottomNav />);

      const mapLink = screen.getByText('Map').closest('a');
      expect(mapLink).toHaveClass('text-coral-700');
    });

    it('marks Hotels as active on reservations page', () => {
      mockUsePathname.mockReturnValue('/reservations');
      render(<BottomNav />);

      const hotelsLink = screen.getByText('Hotels').closest('a');
      expect(hotelsLink).toHaveClass('text-coral-700');
    });

    it('does not mark Home active on other pages', () => {
      mockUsePathname.mockReturnValue('/schedule');
      render(<BottomNav />);

      const homeLink = screen.getByText('Home').closest('a');
      expect(homeLink).not.toHaveClass('text-coral-700');
    });
  });

  describe('styling', () => {
    it('is fixed to the bottom', () => {
      const { container } = render(<BottomNav />);
      const nav = container.querySelector('nav');

      expect(nav).toHaveClass('fixed');
      expect(nav).toHaveClass('bottom-0');
    });

    it('has high z-index', () => {
      const { container } = render(<BottomNav />);
      const nav = container.querySelector('nav');

      expect(nav).toHaveClass('z-50');
    });

    it('has backdrop blur', () => {
      const { container } = render(<BottomNav />);
      const nav = container.querySelector('nav');

      expect(nav).toHaveClass('backdrop-blur-sm');
    });
  });
});
