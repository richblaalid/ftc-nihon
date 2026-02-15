/**
 * Meal selection hooks and functions
 * Handles user's restaurant choices for meals
 */

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../database';
import { useSyncVersion } from './sync';
import type { MealType, MealSelection, Restaurant } from '@/types/database';

/**
 * Get user's meal selection for a specific day and meal
 */
export function useMealSelection(
  dayNumber: number,
  meal: MealType
): MealSelection | null | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(async () => {
    const id = `${dayNumber}-${meal}`;
    const selection = await db.mealSelections.get(id);
    return selection ?? null;
  }, [dayNumber, meal, syncVersion]);
}

/**
 * Get all meal selections for a day
 */
export function useMealSelectionsForDay(
  dayNumber: number
): MealSelection[] | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(
    () => db.mealSelections.where('dayNumber').equals(dayNumber).toArray(),
    [dayNumber, syncVersion]
  );
}

/**
 * Get the selected restaurant for a specific day and meal
 * Returns full restaurant details if a selection exists
 */
export function useSelectedRestaurant(
  dayNumber: number,
  meal: MealType
): Restaurant | null | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(async () => {
    const id = `${dayNumber}-${meal}`;
    const selection = await db.mealSelections.get(id);

    if (!selection) return null;

    const restaurant = await db.restaurants.get(selection.restaurantId);
    return restaurant ?? null;
  }, [dayNumber, meal, syncVersion]);
}

/**
 * Set or update a meal selection
 */
export async function setMealSelection(
  dayNumber: number,
  meal: MealType,
  restaurantId: string
): Promise<void> {
  const now = new Date().toISOString();
  const id = `${dayNumber}-${meal}`;

  const existing = await db.mealSelections.get(id);

  if (existing) {
    await db.mealSelections.update(id, {
      restaurantId,
      selectedAt: now,
      updatedAt: now,
    });
  } else {
    await db.mealSelections.add({
      id,
      dayNumber,
      meal,
      restaurantId,
      selectedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  }
}

/**
 * Clear a meal selection
 */
export async function clearMealSelection(
  dayNumber: number,
  meal: MealType
): Promise<void> {
  const id = `${dayNumber}-${meal}`;
  await db.mealSelections.delete(id);
}
