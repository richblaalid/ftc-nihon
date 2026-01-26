'use client';

import type { ActivityCategory } from '@/types/database';

interface CategoryIconProps {
  category: ActivityCategory;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const CATEGORY_ICONS: Record<ActivityCategory, string> = {
  food: '🍜',
  temple: '⛩️',
  shopping: '🛍️',
  transit: '🚃',
  activity: '🎯',
  hotel: '🏨',
};

const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  food: 'Food',
  temple: 'Temple',
  shopping: 'Shopping',
  transit: 'Transit',
  activity: 'Activity',
  hotel: 'Hotel',
};

const SIZE_CLASSES = {
  sm: 'text-base',
  md: 'text-xl',
  lg: 'text-2xl',
};

export function CategoryIcon({ category, size = 'md', className = '' }: CategoryIconProps) {
  return (
    <span
      className={`${SIZE_CLASSES[size]} ${className}`}
      role="img"
      aria-label={CATEGORY_LABELS[category]}
    >
      {CATEGORY_ICONS[category]}
    </span>
  );
}

/**
 * Get the CSS class for category background color
 */
export function getCategoryBgClass(category: ActivityCategory): string {
  const classes: Record<ActivityCategory, string> = {
    food: 'bg-category-food',
    temple: 'bg-category-temple',
    shopping: 'bg-category-shopping',
    transit: 'bg-category-transit',
    activity: 'bg-category-activity',
    hotel: 'bg-category-hotel',
  };
  return classes[category];
}

/**
 * Get the CSS class for category text color
 */
export function getCategoryTextClass(category: ActivityCategory): string {
  const classes: Record<ActivityCategory, string> = {
    food: 'text-category-food',
    temple: 'text-category-temple',
    shopping: 'text-category-shopping',
    transit: 'text-category-transit',
    activity: 'text-category-activity',
    hotel: 'text-category-hotel',
  };
  return classes[category];
}

/**
 * Get the pill class for a category
 */
export function getCategoryPillClass(category: ActivityCategory): string {
  const classes: Record<ActivityCategory, string> = {
    food: 'pill-food',
    temple: 'pill-temple',
    shopping: 'pill-shopping',
    transit: 'pill-transit',
    activity: 'pill-activity',
    hotel: 'pill-hotel',
  };
  return `pill ${classes[category]}`;
}
