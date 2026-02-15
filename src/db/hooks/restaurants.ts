/**
 * Restaurant-related hooks
 * Provides access to restaurants and meal options
 */

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../database';
import { useSyncVersion } from './sync';
import type { Restaurant, MealType, MealAssignment } from '@/types/database';

/**
 * Restaurant options for a meal with primary and alternatives
 */
export interface RestaurantOptions {
  primary: Restaurant | null;
  alternatives: Restaurant[];
  isIncluded: boolean; // True if meal is included (e.g., ryokan)
}

/**
 * Get restaurants for a specific day
 */
export function useRestaurants(dayNumber?: number): Restaurant[] | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(async () => {
    if (dayNumber !== undefined) {
      return db.restaurants.where('dayNumber').equals(dayNumber).toArray();
    }
    return db.restaurants.toArray();
  }, [dayNumber, syncVersion]);
}

/**
 * Get restaurants by city
 */
export function useRestaurantsByCity(city: string): Restaurant[] | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(
    () => db.restaurants.where('city').equals(city).toArray(),
    [city, syncVersion]
  );
}

/**
 * Get a restaurant by ID
 */
export function useRestaurant(restaurantId: string | null): Restaurant | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(
    () => (restaurantId ? db.restaurants.get(restaurantId) : undefined),
    [restaurantId, syncVersion]
  );
}

/**
 * Get restaurant options for a specific day and meal
 * Returns primary recommendation and alternatives based on assignedMeals
 */
export function useRestaurantOptionsForMeal(
  dayNumber: number,
  meal: MealType
): RestaurantOptions | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(async () => {
    const allRestaurants = await db.restaurants.toArray();

    let primary: Restaurant | null = null;
    const alternatives: Restaurant[] = [];
    let isIncluded = false;

    for (const restaurant of allRestaurants) {
      if (!restaurant.assignedMeals) continue;

      try {
        const assignments: MealAssignment[] = JSON.parse(restaurant.assignedMeals);

        for (const assignment of assignments) {
          if (assignment.day === dayNumber && assignment.meal === meal) {
            if (assignment.priority === 'INCLUDED') {
              primary = restaurant;
              isIncluded = true;
            } else if (assignment.priority === 'primary') {
              primary = restaurant;
            } else {
              alternatives.push(restaurant);
            }
            break; // Only count once per restaurant
          }
        }
      } catch {
        // Skip invalid JSON
        continue;
      }
    }

    return { primary, alternatives, isIncluded };
  }, [dayNumber, meal, syncVersion]);
}

/**
 * Get all restaurant options for a day (all meals)
 */
export function useRestaurantOptionsForDay(
  dayNumber: number
): Map<MealType, RestaurantOptions> | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(async () => {
    const allRestaurants = await db.restaurants.toArray();

    const optionsByMeal = new Map<MealType, RestaurantOptions>();
    const meals: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack', 'afternoon'];

    // Initialize empty options for all meals
    for (const meal of meals) {
      optionsByMeal.set(meal, { primary: null, alternatives: [], isIncluded: false });
    }

    for (const restaurant of allRestaurants) {
      if (!restaurant.assignedMeals) continue;

      try {
        const assignments: MealAssignment[] = JSON.parse(restaurant.assignedMeals);

        for (const assignment of assignments) {
          if (assignment.day !== dayNumber) continue;

          const options = optionsByMeal.get(assignment.meal);
          if (!options) continue;

          if (assignment.priority === 'INCLUDED') {
            options.primary = restaurant;
            options.isIncluded = true;
          } else if (assignment.priority === 'primary') {
            options.primary = restaurant;
          } else {
            options.alternatives.push(restaurant);
          }
        }
      } catch {
        continue;
      }
    }

    return optionsByMeal;
  }, [dayNumber, syncVersion]);
}
