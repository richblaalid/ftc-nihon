'use client';

import { Suspense, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  useRestaurantOptionsForMeal,
  useMealSelection,
} from '@/db/hooks';
import { RestaurantList } from '@/components/restaurants/RestaurantList';
import { RestaurantMap } from '@/components/restaurants/RestaurantMap';
import { useGeolocation } from '@/lib/hooks/useGeolocation';
import type { MealType, Restaurant } from '@/types/database';

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
  afternoon: 'Afternoon Tea',
};

/**
 * Parse the meal param to extract day number and meal type
 * Format: "day-2-dinner" -> { dayNumber: 2, meal: 'dinner' }
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

function RestaurantOptionsContent() {
  const params = useParams();
  const router = useRouter();
  const mealParam = params.meal as string;

  // Parse params early but use defaults for hooks
  const parsed = useMemo(() => parseMealParam(mealParam), [mealParam]);
  const dayNumber = parsed?.dayNumber ?? 1;
  const meal = parsed?.meal ?? 'dinner';

  // All hooks called unconditionally with potentially default values
  const options = useRestaurantOptionsForMeal(dayNumber, meal);
  const selection = useMealSelection(dayNumber, meal);

  // User location
  const { lat, lng, isTracking, startTracking } = useGeolocation();
  const userLocation = lat && lng ? { lat, lng } : null;

  // State for highlighted restaurant (from map pin click)
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [kidFriendlyOnly, setKidFriendlyOnly] = useState(false);

  // Handle pin click from map
  const handlePinClick = useCallback((restaurant: Restaurant) => {
    setHighlightedId(restaurant.id);
  }, []);

  // Handle card click from list
  const handleCardClick = useCallback(
    (restaurant: Restaurant) => {
      router.push(`/restaurants/${mealParam}/${restaurant.id}`);
    },
    [router, mealParam]
  );

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

  // Combine primary and alternatives into one list
  const allRestaurants: Restaurant[] = [];
  if (options?.primary) {
    allRestaurants.push(options.primary);
  }
  if (options?.alternatives) {
    allRestaurants.push(...options.alternatives);
  }

  // Filter by kid-friendly if enabled
  const filteredRestaurants = kidFriendlyOnly
    ? allRestaurants.filter((r) => r.isKidFriendly)
    : allRestaurants;

  // Loading state
  if (options === undefined) {
    return <RestaurantOptionsLoading />;
  }

  return (
    <div
      className="flex flex-col bg-background overflow-hidden"
      style={{ height: 'calc(100dvh - 4rem - env(safe-area-inset-bottom))' }}
    >
      {/* Header */}
      <header className="flex-shrink-0 px-4 py-3 bg-background border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/schedule?day=${dayNumber}`}
              aria-label="Back to schedule"
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
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                Day {dayNumber} {MEAL_LABELS[meal]}
              </h1>
              <p className="text-xs text-foreground-secondary">
                {filteredRestaurants.length} option{filteredRestaurants.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Kid-friendly filter */}
            <button
              onClick={() => setKidFriendlyOnly(!kidFriendlyOnly)}
              aria-label={kidFriendlyOnly ? 'Show all restaurants' : 'Show kid-friendly only'}
              className={`p-2 rounded-lg text-sm ${
                kidFriendlyOnly
                  ? 'bg-primary/10 text-primary'
                  : 'bg-background-secondary text-foreground-secondary'
              }`}
            >
              👶
            </button>

            {/* Location toggle */}
            <button
              onClick={() => !isTracking && startTracking()}
              aria-label={isTracking ? 'Location tracking enabled' : 'Enable location tracking'}
              className={`p-2 rounded-lg ${
                isTracking
                  ? 'bg-primary/10 text-primary'
                  : 'bg-background-secondary text-foreground-secondary'
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Map section - 40% of remaining height */}
      <div className="flex-shrink-0 relative" style={{ height: '40%' }}>
        <RestaurantMap
          restaurants={filteredRestaurants}
          selectedId={selection?.restaurantId ?? null}
          highlightedId={highlightedId}
          userLocation={userLocation}
          onPinClick={handlePinClick}
        />
      </div>

      {/* Restaurant list - 60% of remaining height */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <RestaurantList
          restaurants={filteredRestaurants}
          primaryId={options.primary?.id ?? null}
          selectedId={selection?.restaurantId ?? null}
          highlightedId={highlightedId}
          onCardClick={handleCardClick}
        />
      </div>
    </div>
  );
}

function RestaurantOptionsLoading() {
  return (
    <div
      className="flex flex-col bg-background overflow-hidden"
      style={{ height: 'calc(100dvh - 4rem - env(safe-area-inset-bottom))' }}
    >
      <header className="flex-shrink-0 px-4 py-3 bg-background border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-background-secondary rounded-lg animate-pulse" />
          <div>
            <div className="w-32 h-5 bg-background-secondary rounded animate-pulse" />
            <div className="w-16 h-3 mt-1 bg-background-secondary rounded animate-pulse" />
          </div>
        </div>
      </header>

      {/* Map skeleton */}
      <div
        className="flex-shrink-0 bg-background-secondary animate-pulse flex items-center justify-center"
        style={{ height: '40%' }}
      >
        <p className="text-foreground-secondary text-sm">Loading map...</p>
      </div>

      {/* List skeleton */}
      <div className="flex-1 p-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-5 w-32 bg-background-secondary rounded" />
            <div className="h-4 w-24 mt-2 bg-background-secondary rounded" />
            <div className="h-3 w-48 mt-2 bg-background-secondary rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RestaurantOptionsPage() {
  return (
    <Suspense fallback={<RestaurantOptionsLoading />}>
      <RestaurantOptionsContent />
    </Suspense>
  );
}
