'use client';

import Link from 'next/link';
import type { Restaurant, MealType, MealSelection } from '@/types/database';

interface RestaurantOptions {
  primary: Restaurant | null;
  alternatives: Restaurant[];
  isIncluded: boolean;
}

interface RestaurantOptionsCardProps {
  dayNumber: number;
  meal: MealType;
  options: RestaurantOptions;
  selection: MealSelection | null;
  selectedRestaurant: Restaurant | null;
}

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
  afternoon: 'Afternoon Tea',
};

const MEAL_ICONS: Record<MealType, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍡',
  afternoon: '🍵',
};

/**
 * Restaurant options card displayed in the daily schedule
 * Shows meal type, selection status, and primary recommendation
 */
export function RestaurantOptionsCard({
  dayNumber,
  meal,
  options,
  selection,
  selectedRestaurant,
}: RestaurantOptionsCardProps) {
  const totalOptions = (options.primary ? 1 : 0) + options.alternatives.length;
  const hasOptions = totalOptions > 0;

  // Handle included meals (ryokan, hotel breakfast)
  if (options.isIncluded) {
    return (
      <div
        data-testid="restaurant-options-card-included"
        className="card relative overflow-hidden border-l-4 border-category-food bg-category-food/5"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl" role="img" aria-label={MEAL_LABELS[meal]}>
            {MEAL_ICONS[meal]}
          </span>
          <div className="flex-1">
            <h4 className="font-medium text-foreground">{MEAL_LABELS[meal]}</h4>
            <p className="text-sm text-foreground-secondary">Included with accommodation</p>
          </div>
          <span className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
            Included
          </span>
        </div>
      </div>
    );
  }

  // No restaurant options for this meal
  if (!hasOptions) {
    return null;
  }

  // User has selected a restaurant
  if (selection && selectedRestaurant) {
    return (
      <Link
        href={`/restaurants/day-${dayNumber}-${meal}`}
        data-testid="restaurant-options-card-selected"
        className="card relative block overflow-hidden border-l-4 border-category-food transition-transform active:scale-[0.98]"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl" role="img" aria-label={MEAL_LABELS[meal]}>
            {MEAL_ICONS[meal]}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-foreground">{MEAL_LABELS[meal]}</h4>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                Selected
              </span>
            </div>
            <p className="mt-0.5 truncate text-sm font-medium text-foreground">
              {selectedRestaurant.name}
            </p>
            {selectedRestaurant.type && (
              <p className="text-xs text-foreground-secondary">{selectedRestaurant.type}</p>
            )}
          </div>
          <span className="text-foreground-tertiary">›</span>
        </div>
      </Link>
    );
  }

  // No selection yet - show primary recommendation
  const primaryName = options.primary?.name ?? 'View options';
  const primaryType = options.primary?.type;

  return (
    <Link
      href={`/restaurants/day-${dayNumber}-${meal}`}
      data-testid="restaurant-options-card"
      className="card relative block overflow-hidden border-l-4 border-category-food/50 transition-transform active:scale-[0.98]"
    >
      <div className="flex items-center gap-3">
        <span className="text-xl" role="img" aria-label={MEAL_LABELS[meal]}>
          {MEAL_ICONS[meal]}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-foreground">{MEAL_LABELS[meal]}</h4>
            <span className="rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
              Choose
            </span>
          </div>
          {options.primary ? (
            <>
              <p className="mt-0.5 truncate text-sm text-foreground-secondary">
                Suggested: {primaryName}
              </p>
              {primaryType && (
                <p className="text-xs text-foreground-tertiary">{primaryType}</p>
              )}
            </>
          ) : (
            <p className="mt-0.5 text-sm text-foreground-secondary">
              {totalOptions} option{totalOptions !== 1 ? 's' : ''} available
            </p>
          )}
        </div>
        <span className="text-foreground-tertiary">›</span>
      </div>
    </Link>
  );
}
