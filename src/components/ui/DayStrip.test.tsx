import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DayStrip } from './DayStrip';

describe('DayStrip', () => {
  const defaultProps = {
    selectedDay: 5,
    currentDay: 5,
    onDayChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders all 16 trip days (0-15)', () => {
      render(<DayStrip {...defaultProps} />);

      // Check for buttons with day numbers (use word boundary to avoid matching Day 1 with Day 10)
      for (let day = 0; day <= 15; day++) {
        expect(screen.getByRole('option', { name: new RegExp(`Day ${day},`) })).toBeInTheDocument();
      }
    });

    it('renders city labels', () => {
      render(<DayStrip {...defaultProps} />);

      expect(screen.getAllByText('Travel')).toHaveLength(2); // Start and end
      expect(screen.getByText('Tokyo')).toBeInTheDocument();
      expect(screen.getByText('Hakone')).toBeInTheDocument();
      expect(screen.getByText('Kyoto')).toBeInTheDocument();
      expect(screen.getByText('Osaka')).toBeInTheDocument();
    });

    it('has listbox role for accessibility', () => {
      render(<DayStrip {...defaultProps} />);
      expect(screen.getByRole('listbox', { name: 'Trip days' })).toBeInTheDocument();
    });
  });

  describe('selection', () => {
    it('marks selected day with aria-selected', () => {
      render(<DayStrip {...defaultProps} selectedDay={8} />);

      const day8Button = screen.getByRole('option', { name: /Day 8/ });
      expect(day8Button).toHaveAttribute('aria-selected', 'true');
    });

    it('calls onDayChange when a day is clicked', () => {
      const handleChange = vi.fn();
      render(<DayStrip {...defaultProps} onDayChange={handleChange} />);

      const day10Button = screen.getByRole('option', { name: /Day 10/ });
      fireEvent.click(day10Button);

      expect(handleChange).toHaveBeenCalledWith(10);
    });

    it('calls onDayChange for each clicked day', () => {
      const handleChange = vi.fn();
      render(<DayStrip {...defaultProps} onDayChange={handleChange} />);

      const day3Button = screen.getByRole('option', { name: /Day 3/ });
      const day12Button = screen.getByRole('option', { name: /Day 12/ });

      fireEvent.click(day3Button);
      fireEvent.click(day12Button);

      expect(handleChange).toHaveBeenCalledTimes(2);
      expect(handleChange).toHaveBeenCalledWith(3);
      expect(handleChange).toHaveBeenCalledWith(12);
    });
  });

  describe('current day indicator', () => {
    it('includes "Today" in aria-label for current day', () => {
      render(<DayStrip {...defaultProps} currentDay={7} />);

      const day7Button = screen.getByRole('option', { name: /Day 7.*Today/ });
      expect(day7Button).toBeInTheDocument();
    });

    it('does not include "Today" for non-current days', () => {
      render(<DayStrip {...defaultProps} currentDay={7} />);

      const day5Button = screen.getByRole('option', { name: /Day 5/ });
      expect(day5Button.getAttribute('aria-label')).not.toContain('Today');
    });
  });

  describe('city mapping', () => {
    it('includes correct city in aria-label for Tokyo day', () => {
      render(<DayStrip {...defaultProps} />);

      const day2Button = screen.getByRole('option', { name: /Day 2.*Tokyo/ });
      expect(day2Button).toBeInTheDocument();
    });

    it('includes correct city in aria-label for Hakone day', () => {
      render(<DayStrip {...defaultProps} />);

      const day6Button = screen.getByRole('option', { name: /Day 6.*Hakone/ });
      expect(day6Button).toBeInTheDocument();
    });

    it('includes correct city in aria-label for Kyoto day', () => {
      render(<DayStrip {...defaultProps} />);

      const day8Button = screen.getByRole('option', { name: /Day 8.*Kyoto/ });
      expect(day8Button).toBeInTheDocument();
    });

    it('includes correct city in aria-label for Osaka day', () => {
      render(<DayStrip {...defaultProps} />);

      const day12Button = screen.getByRole('option', { name: /Day 12.*Osaka/ });
      expect(day12Button).toBeInTheDocument();
    });
  });

  describe('progress bar', () => {
    it('renders progress bar', () => {
      const { container } = render(<DayStrip {...defaultProps} selectedDay={8} />);

      const progressBar = container.querySelector('[aria-hidden="true"]');
      expect(progressBar).toBeInTheDocument();
    });
  });
});
