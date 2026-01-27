'use client';

import type { ActivityCategory } from '@/types/database';

interface PinProps {
  category: ActivityCategory;
  size?: 'sm' | 'md' | 'lg';
  isSelected?: boolean;
  className?: string;
}

// Category colors matching our design system
const CATEGORY_COLORS: Record<ActivityCategory, string> = {
  food: 'bg-category-food',
  temple: 'bg-category-temple',
  shopping: 'bg-category-shopping',
  transit: 'bg-category-transit',
  activity: 'bg-category-activity',
  hotel: 'bg-category-hotel',
};

// Category icons
const CATEGORY_ICONS: Record<ActivityCategory, string> = {
  food: '🍜',
  temple: '⛩️',
  shopping: '🛍️',
  transit: '🚃',
  activity: '🎯',
  hotel: '🏨',
};

const SIZE_CLASSES = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
};

/**
 * Map pin component for displaying category-colored markers
 * Can be used standalone or as part of a legend
 */
export function Pin({ category, size = 'md', isSelected = false, className = '' }: PinProps) {
  return (
    <div
      className={`
        relative flex items-center justify-center rounded-full border-2 border-white shadow-md
        ${CATEGORY_COLORS[category]}
        ${SIZE_CLASSES[size]}
        ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
        ${className}
      `}
    >
      <span className="drop-shadow-sm">{CATEGORY_ICONS[category]}</span>
    </div>
  );
}

/**
 * User location pin (blue dot)
 */
export function UserLocationPin({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div
      className={`
        rounded-full border-2 border-white bg-blue-500 shadow-md
        ${sizeClasses[size]}
        ${className}
      `}
    />
  );
}

/**
 * Pin legend showing all categories - compact single row
 */
export function PinLegend() {
  const categories: ActivityCategory[] = ['food', 'temple', 'shopping', 'transit', 'activity', 'hotel'];
  const labels: Record<ActivityCategory, string> = {
    food: 'Food',
    temple: 'Temple',
    shopping: 'Shop',
    transit: 'Train',
    activity: 'Activity',
    hotel: 'Hotel',
  };

  return (
    <div className="flex items-center justify-between gap-1">
      {categories.map((category) => (
        <div key={category} className="flex flex-col items-center gap-0.5">
          <div
            className={`w-6 h-6 flex items-center justify-center rounded-full border border-white/50 shadow-sm text-xs ${CATEGORY_COLORS[category]}`}
          >
            {CATEGORY_ICONS[category]}
          </div>
          <span className="text-[10px] text-foreground-secondary">{labels[category]}</span>
        </div>
      ))}
    </div>
  );
}
