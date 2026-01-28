import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  CategoryIcon,
  getCategoryBgClass,
  getCategoryTextClass,
  getCategoryPillClass,
} from './CategoryIcon';
import type { ActivityCategory } from '@/types/database';

describe('CategoryIcon', () => {
  const categories: ActivityCategory[] = ['food', 'temple', 'shopping', 'transit', 'activity', 'hotel'];

  describe('rendering', () => {
    it('renders the correct icon for food category', () => {
      render(<CategoryIcon category="food" />);
      expect(screen.getByRole('img', { name: 'Food' })).toHaveTextContent('🍜');
    });

    it('renders the correct icon for temple category', () => {
      render(<CategoryIcon category="temple" />);
      expect(screen.getByRole('img', { name: 'Temple' })).toHaveTextContent('⛩️');
    });

    it('renders the correct icon for shopping category', () => {
      render(<CategoryIcon category="shopping" />);
      expect(screen.getByRole('img', { name: 'Shopping' })).toHaveTextContent('🛍️');
    });

    it('renders the correct icon for transit category', () => {
      render(<CategoryIcon category="transit" />);
      expect(screen.getByRole('img', { name: 'Transit' })).toHaveTextContent('🚃');
    });

    it('renders the correct icon for activity category', () => {
      render(<CategoryIcon category="activity" />);
      expect(screen.getByRole('img', { name: 'Activity' })).toHaveTextContent('🎯');
    });

    it('renders the correct icon for hotel category', () => {
      render(<CategoryIcon category="hotel" />);
      expect(screen.getByRole('img', { name: 'Hotel' })).toHaveTextContent('🏨');
    });
  });

  describe('sizes', () => {
    it('applies small size class', () => {
      render(<CategoryIcon category="food" size="sm" />);
      const icon = screen.getByRole('img', { name: 'Food' });
      expect(icon).toHaveClass('text-base');
    });

    it('applies medium size class by default', () => {
      render(<CategoryIcon category="food" />);
      const icon = screen.getByRole('img', { name: 'Food' });
      expect(icon).toHaveClass('text-xl');
    });

    it('applies large size class', () => {
      render(<CategoryIcon category="food" size="lg" />);
      const icon = screen.getByRole('img', { name: 'Food' });
      expect(icon).toHaveClass('text-2xl');
    });
  });

  describe('custom className', () => {
    it('applies custom className', () => {
      render(<CategoryIcon category="food" className="custom-class" />);
      const icon = screen.getByRole('img', { name: 'Food' });
      expect(icon).toHaveClass('custom-class');
    });
  });

  describe('accessibility', () => {
    it.each(categories)('has proper aria-label for %s', (category) => {
      render(<CategoryIcon category={category} />);
      const icon = screen.getByRole('img');
      expect(icon).toHaveAttribute('aria-label');
    });
  });
});

describe('getCategoryBgClass', () => {
  it('returns correct class for food', () => {
    expect(getCategoryBgClass('food')).toBe('bg-category-food');
  });

  it('returns correct class for temple', () => {
    expect(getCategoryBgClass('temple')).toBe('bg-category-temple');
  });

  it('returns correct class for shopping', () => {
    expect(getCategoryBgClass('shopping')).toBe('bg-category-shopping');
  });

  it('returns correct class for transit', () => {
    expect(getCategoryBgClass('transit')).toBe('bg-category-transit');
  });

  it('returns correct class for activity', () => {
    expect(getCategoryBgClass('activity')).toBe('bg-category-activity');
  });

  it('returns correct class for hotel', () => {
    expect(getCategoryBgClass('hotel')).toBe('bg-category-hotel');
  });
});

describe('getCategoryTextClass', () => {
  it('returns correct class for food', () => {
    expect(getCategoryTextClass('food')).toBe('text-category-food');
  });

  it('returns correct class for temple', () => {
    expect(getCategoryTextClass('temple')).toBe('text-category-temple');
  });

  it('returns correct class for shopping', () => {
    expect(getCategoryTextClass('shopping')).toBe('text-category-shopping');
  });

  it('returns correct class for transit', () => {
    expect(getCategoryTextClass('transit')).toBe('text-category-transit');
  });

  it('returns correct class for activity', () => {
    expect(getCategoryTextClass('activity')).toBe('text-category-activity');
  });

  it('returns correct class for hotel', () => {
    expect(getCategoryTextClass('hotel')).toBe('text-category-hotel');
  });
});

describe('getCategoryPillClass', () => {
  it('returns correct class for food', () => {
    expect(getCategoryPillClass('food')).toBe('pill pill-food');
  });

  it('returns correct class for temple', () => {
    expect(getCategoryPillClass('temple')).toBe('pill pill-temple');
  });

  it('returns correct class for shopping', () => {
    expect(getCategoryPillClass('shopping')).toBe('pill pill-shopping');
  });

  it('returns correct class for transit', () => {
    expect(getCategoryPillClass('transit')).toBe('pill pill-transit');
  });

  it('returns correct class for activity', () => {
    expect(getCategoryPillClass('activity')).toBe('pill pill-activity');
  });

  it('returns correct class for hotel', () => {
    expect(getCategoryPillClass('hotel')).toBe('pill pill-hotel');
  });
});
