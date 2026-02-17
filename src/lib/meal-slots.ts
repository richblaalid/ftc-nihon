/**
 * Meal slot logic for restaurant options in daily schedule
 * Determines when to show restaurant option cards and handles special cases
 */

import type { Activity, MealType, DayInfo, MealPlan } from '@/types/database';
import { safeJsonParse } from '@/lib/json-utils';
import {
  parseTimeToMinutes,
  isTimeBetween,
  minutesToTimeString,
} from '@/lib/time-utils';

/**
 * Meal slot information for schedule display
 *
 * Design Rules (see docs/meal-card-refactor-plan.md):
 * - One card per meal slot: exactly one card in timeline per meal
 * - Food activities take precedence: if exists in time range, becomes the meal plan
 * - MealSlot is the single source of truth for rendering
 */
export interface MealSlot {
  meal: MealType;
  suggestedTime: string; // HH:MM format
  showOptions: boolean; // Whether to show restaurant options
  reason?: string; // Reason if not showing (e.g., "Hotel breakfast")
  scheduledActivity?: Activity; // Food activity covering this slot (if any)
}

/**
 * Default meal times in HH:MM format
 */
const DEFAULT_MEAL_TIMES: Record<MealType, string> = {
  breakfast: '08:00',
  lunch: '12:30',
  dinner: '18:30',
  snack: '15:00',
  afternoon: '15:00',
};

/**
 * Meals that should be checked for options
 */
const MAIN_MEALS: MealType[] = ['breakfast', 'lunch', 'dinner'];

/**
 * Wrapper for parseTimeToMinutes that returns 0 for invalid times
 * (maintains backward compatibility with existing logic)
 */
function timeToMinutes(time: string): number {
  return parseTimeToMinutes(time) ?? 0;
}

/**
 * Get meal slots for a day based on activities and meal plan
 *
 * @param dayNumber - The trip day number (1-15)
 * @param activities - Activities for that day
 * @param dayInfo - Optional day info with meal plan
 * @returns Array of meal slots to display in schedule
 */
export function getMealSlotsForDay(
  dayNumber: number,
  activities: Activity[],
  dayInfo?: DayInfo | null
): MealSlot[] {
  const slots: MealSlot[] = [];

  // Parse meal plan from dayInfo if available (safe parse prevents crashes)
  const mealPlan: MealPlan | null = safeJsonParse<MealPlan | null>(
    dayInfo?.meals,
    null
  );

  for (const meal of MAIN_MEALS) {
    const slot = getMealSlotInfo(meal, dayNumber, activities, mealPlan);
    if (slot) {
      slots.push(slot);
    }
  }

  // Sort by suggested time
  slots.sort((a, b) => timeToMinutes(a.suggestedTime) - timeToMinutes(b.suggestedTime));

  return slots;
}

/**
 * Generic meal activity names that are placeholders, not specific venues
 * These should still show restaurant options
 */
const GENERIC_MEAL_NAMES = [
  'breakfast',
  'lunch',
  'dinner',
  'snack',
  'meal',
  'food',
  'eat',
];

/**
 * Check if an activity name is a generic placeholder vs a specific venue
 */
function isGenericMealActivity(name: string): boolean {
  const lowerName = name.toLowerCase().trim();
  return GENERIC_MEAL_NAMES.some(generic =>
    lowerName === generic || lowerName.startsWith(generic + ' ')
  );
}

/**
 * Get meal slot info for a specific meal
 *
 * Design Rules:
 * - Food activities take precedence over restaurant options
 * - Generic activities (e.g., "Breakfast") still show options as they're placeholders
 * - Specific venues (e.g., "Tsukiji Market") suppress options
 */
function getMealSlotInfo(
  meal: MealType,
  dayNumber: number,
  activities: Activity[],
  mealPlan: MealPlan | null
): MealSlot | null {
  const defaultTime = DEFAULT_MEAL_TIMES[meal];

  // Check meal plan for special handling
  const planNote = mealPlan?.[meal as keyof MealPlan];

  // Check if meal is included with accommodation
  // Also find and attach any food activity to prevent duplicate rendering
  if (planNote) {
    const lowerNote = planNote.toLowerCase();

    // Skip if meal is included at hotel (must explicitly say "included" or "hotel breakfast")
    if (meal === 'breakfast' && (lowerNote.includes('hotel breakfast') || (lowerNote.includes('hotel') && lowerNote.includes('included')))) {
      const scheduledActivity = findFoodActivityForMeal(meal, activities);
      return {
        meal,
        suggestedTime: scheduledActivity?.startTime ?? defaultTime,
        showOptions: false,
        reason: 'Hotel breakfast included',
        scheduledActivity,
      };
    }

    // Skip if included with ryokan
    if (lowerNote.includes('ryokan') || lowerNote.includes('yoshimatsu')) {
      const scheduledActivity = findFoodActivityForMeal(meal, activities);
      return {
        meal,
        suggestedTime: scheduledActivity?.startTime ?? defaultTime,
        showOptions: false,
        reason: 'Included with accommodation',
        scheduledActivity,
      };
    }

    // Skip if explicitly noted as not needed
    if (lowerNote.includes('skip') || lowerNote.includes('not needed')) {
      return null;
    }
  }

  // Check for Hakone ryokan days:
  // Day 6: Arrive, dinner included
  // Day 7: Full day - breakfast AND dinner included
  // Day 8: Checkout - breakfast included
  // Also find and attach the food activity to prevent duplicate rendering
  if (dayNumber === 6 && meal === 'dinner') {
    const scheduledActivity = findFoodActivityForMeal(meal, activities);
    return {
      meal,
      suggestedTime: scheduledActivity?.startTime ?? '18:00',
      showOptions: false,
      reason: 'Ryokan dinner included',
      scheduledActivity,
    };
  }
  if (dayNumber === 7) {
    if (meal === 'breakfast') {
      const scheduledActivity = findFoodActivityForMeal(meal, activities);
      return {
        meal,
        suggestedTime: scheduledActivity?.startTime ?? '07:30',
        showOptions: false,
        reason: 'Ryokan breakfast included',
        scheduledActivity,
      };
    }
    if (meal === 'dinner') {
      const scheduledActivity = findFoodActivityForMeal(meal, activities);
      return {
        meal,
        suggestedTime: scheduledActivity?.startTime ?? '18:00',
        showOptions: false,
        reason: 'Ryokan dinner included',
        scheduledActivity,
      };
    }
  }
  if (dayNumber === 8 && meal === 'breakfast') {
    const scheduledActivity = findFoodActivityForMeal(meal, activities);
    return {
      meal,
      suggestedTime: scheduledActivity?.startTime ?? '07:00',
      showOptions: false,
      reason: 'Ryokan breakfast included',
      scheduledActivity,
    };
  }

  // Check for food activities in this meal's time range
  const scheduledActivity = findFoodActivityForMeal(meal, activities);

  if (scheduledActivity) {
    const isGeneric = isGenericMealActivity(scheduledActivity.name);

    return {
      meal,
      suggestedTime: scheduledActivity.startTime,
      showOptions: isGeneric, // Generic placeholders still show options
      scheduledActivity,
      reason: isGeneric ? undefined : scheduledActivity.name,
    };
  }

  // Calculate suggested time based on activity gaps
  const suggestedTime = calculateMealTime(meal, activities, defaultTime);

  return {
    meal,
    suggestedTime,
    showOptions: true,
  };
}

/**
 * Time ranges for each meal type
 * Used for both finding food activities and calculating gaps
 */
const MEAL_TIME_RANGES: Record<MealType, { start: string; end: string }> = {
  breakfast: { start: '07:00', end: '10:00' },
  lunch: { start: '11:30', end: '14:00' },
  dinner: { start: '17:30', end: '21:00' },
  snack: { start: '14:00', end: '17:00' },
  afternoon: { start: '14:00', end: '17:00' },
};

/**
 * Find a food activity scheduled within a meal's time range
 *
 * @param meal - The meal type to search for
 * @param activities - All activities for the day
 * @returns The food activity if found, undefined otherwise
 */
function findFoodActivityForMeal(
  meal: MealType,
  activities: Activity[]
): Activity | undefined {
  const range = MEAL_TIME_RANGES[meal];

  const sortedActivities = [...activities].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  for (const activity of sortedActivities) {
    if (activity.category === 'food') {
      if (isTimeBetween(activity.startTime, range.start, range.end)) {
        return activity;
      }
    }
  }

  return undefined;
}

/**
 * Calculate meal time based on gaps between activities
 */
function calculateMealTime(
  meal: MealType,
  activities: Activity[],
  defaultTime: string
): string {
  if (activities.length === 0) {
    return defaultTime;
  }

  const range = MEAL_TIME_RANGES[meal];

  // Find gaps in activities within the meal time range
  const sortedActivities = [...activities].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  // Check if there's a food activity already scheduled in this range
  // (This is a fallback - getMealSlotInfo should have already handled this)
  for (const activity of sortedActivities) {
    if (activity.category === 'food') {
      if (isTimeBetween(activity.startTime, range.start, range.end)) {
        // There's already a food activity in this slot
        return activity.startTime;
      }
    }
  }

  // Find the best gap for the meal
  for (let i = 0; i < sortedActivities.length; i++) {
    const current = sortedActivities[i];
    const next = sortedActivities[i + 1];

    if (!current) continue;

    const currentEnd = current.durationMinutes
      ? addMinutes(current.startTime, current.durationMinutes)
      : current.startTime;

    const nextStart = next?.startTime ?? '23:59';

    // Check if this gap falls within the meal range
    if (timeToMinutes(currentEnd) >= timeToMinutes(range.start) &&
        timeToMinutes(currentEnd) <= timeToMinutes(range.end)) {
      // Check if there's enough time (at least 45 minutes for a meal)
      const gapMinutes = timeToMinutes(nextStart) - timeToMinutes(currentEnd);
      if (gapMinutes >= 45) {
        return currentEnd;
      }
    }
  }

  return defaultTime;
}

/**
 * Add minutes to a time string
 */
function addMinutes(time: string, minutes: number): string {
  return minutesToTimeString(timeToMinutes(time) + minutes);
}

/**
 * Check if meal options should be shown for a specific day and meal
 *
 * @param dayNumber - The trip day number (1-15)
 * @param meal - The meal type
 * @param mealPlan - Optional meal plan from day info
 * @returns Whether to show restaurant options
 */
export function shouldShowMealOptions(
  dayNumber: number,
  meal: MealType,
  mealPlan?: MealPlan | null
): boolean {
  // Check meal plan for explicit handling
  if (mealPlan) {
    const planNote = mealPlan[meal as keyof MealPlan];
    if (planNote) {
      const lowerNote = planNote.toLowerCase();

      // Don't show options if included with accommodation
      // Must explicitly say "included" or be a ryokan (where meals are always included)
      if (
        lowerNote.includes('included') ||
        lowerNote.includes('ryokan') ||
        lowerNote.includes('yoshimatsu')
      ) {
        return false;
      }
    }
  }

  // Special handling for Hakone ryokan days
  // Day 6: dinner included (arrival)
  // Day 7: breakfast AND dinner included (full day)
  // Day 8: breakfast included (checkout)
  if (dayNumber === 6 && meal === 'dinner') {
    return false;
  }
  if (dayNumber === 7 && (meal === 'breakfast' || meal === 'dinner')) {
    return false;
  }
  if (dayNumber === 8 && meal === 'breakfast') {
    return false;
  }

  return true;
}

/**
 * Get the position in the timeline where a meal slot should be inserted
 * Returns the index of the activity after which the meal slot should appear
 *
 * @param mealSlot - The meal slot to position
 * @param activities - Activities for the day
 * @returns Index to insert after, or -1 to insert at beginning
 */
export function getMealSlotPosition(
  mealSlot: MealSlot,
  activities: Activity[]
): number {
  const mealTime = timeToMinutes(mealSlot.suggestedTime);

  // Sort activities by start time
  const sortedActivities = [...activities].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  // Find the last activity that starts before the meal time
  let insertAfter = -1;
  for (let i = 0; i < sortedActivities.length; i++) {
    const activity = sortedActivities[i];
    if (!activity) continue;

    const activityStart = timeToMinutes(activity.startTime);

    // Calculate activity end time
    let activityEnd = activityStart;
    if (activity.durationMinutes) {
      activityEnd = activityStart + activity.durationMinutes;
    }

    // If meal time is after this activity ends, insert after it
    if (mealTime >= activityEnd) {
      insertAfter = i;
    } else {
      break;
    }
  }

  return insertAfter;
}
