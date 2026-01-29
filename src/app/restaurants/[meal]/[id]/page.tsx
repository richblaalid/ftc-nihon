'use client';

import { Suspense, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  useRestaurant,
  useMealSelection,
  setMealSelection,
  clearMealSelection,
} from '@/db/hooks';
import { RestaurantDetail } from '@/components/restaurants/RestaurantDetail';
import type { MealType } from '@/types/database';

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
  afternoon: 'Afternoon Tea',
};

/**
 * Parse the meal param to extract day number and meal type
 */
function parseMealParam(param: string): { dayNumber: number; meal: MealType } | null {
  const match = param.match(/^day-(\d+)-(\w+)$/);
  if (!match || !match[1] || !match[2]) return null;

  const dayNumber = parseInt(match[1], 10);
  const mealStr = match[2] as MealType;

  if (isNaN(dayNumber) || dayNumber < 0 || dayNumber > 15) return null;
  if (!['breakfast', 'lunch', 'dinner', 'snack', 'afternoon'].includes(mealStr)) return null;

  return { dayNumber, meal: mealStr };
}

function RestaurantDetailContent() {
  const params = useParams();
  const router = useRouter();
  const mealParam = params.meal as string;
  const restaurantId = params.id as string;

  // Parse params early but use defaults for hooks
  const parsed = useMemo(() => parseMealParam(mealParam), [mealParam]);
  const dayNumber = parsed?.dayNumber ?? 1;
  const meal = parsed?.meal ?? 'dinner';

  // Get restaurant and selection data
  const restaurant = useRestaurant(restaurantId);
  const selection = useMealSelection(dayNumber, meal);
  const isSelected = selection?.restaurantId === restaurantId;

  // Handle selection
  const handleSelect = useCallback(async () => {
    if (isSelected) {
      await clearMealSelection(dayNumber, meal);
    } else {
      await setMealSelection(dayNumber, meal, restaurantId);
    }
    // Navigate back to options page
    router.push(`/restaurants/${mealParam}`);
  }, [isSelected, dayNumber, meal, restaurantId, router, mealParam]);

  // Now check if parsing failed (after all hooks)
  if (!parsed) {
    return (
      <div className="flex min-h-full items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg text-foreground">Invalid URL</p>
          <Link href="/schedule" className="mt-2 text-primary underline">
            Back to Schedule
          </Link>
        </div>
      </div>
    );
  }

  // Loading state
  if (restaurant === undefined) {
    return <RestaurantDetailLoading />;
  }

  // Restaurant not found
  if (restaurant === null) {
    return (
      <div className="flex min-h-full items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg text-foreground">Restaurant not found</p>
          <Link href={`/restaurants/${mealParam}`} className="mt-2 text-primary underline">
            Back to Options
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background pb-safe">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href={`/restaurants/${mealParam}`}
            aria-label="Back to options"
            className="p-2 -ml-2 rounded-lg hover:bg-background-secondary"
          >
            <svg
              className="w-5 h-5 text-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-foreground truncate">
              {restaurant.name}
            </h1>
            <p className="text-xs text-foreground-secondary">
              Day {dayNumber} {MEAL_LABELS[meal]}
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-4">
        <RestaurantDetail
          restaurant={restaurant}
          isSelected={isSelected}
          mealLabel={MEAL_LABELS[meal]}
          onSelect={handleSelect}
        />
      </main>
    </div>
  );
}

function RestaurantDetailLoading() {
  return (
    <div className="min-h-full bg-background">
      <header className="px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-background-secondary rounded-lg animate-pulse" />
          <div className="flex-1">
            <div className="w-40 h-5 bg-background-secondary rounded animate-pulse" />
            <div className="w-24 h-3 mt-1 bg-background-secondary rounded animate-pulse" />
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* Map skeleton */}
        <div className="h-48 bg-background-secondary rounded-xl animate-pulse" />

        {/* Info skeleton */}
        <div className="card space-y-3">
          <div className="h-6 w-32 bg-background-secondary rounded animate-pulse" />
          <div className="h-4 w-48 bg-background-secondary rounded animate-pulse" />
          <div className="h-4 w-40 bg-background-secondary rounded animate-pulse" />
        </div>

        {/* Button skeleton */}
        <div className="h-12 bg-background-secondary rounded-xl animate-pulse" />
      </main>
    </div>
  );
}

export default function RestaurantDetailPage() {
  return (
    <Suspense fallback={<RestaurantDetailLoading />}>
      <RestaurantDetailContent />
    </Suspense>
  );
}
