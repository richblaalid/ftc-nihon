/**
 * Meal slot logic for restaurant options in daily schedule
 * Determines when to show restaurant option cards and handles special cases
 */

import type { Activity, MealType, DayInfo, MealPlan } from '@/types/database';

/**
 * Meal slot information for schedule display
 */
export interface MealSlot {
  meal: MealType;
  suggestedTime: string; // HH:MM format
  showOptions: boolean; // Whether to show restaurant options
  reason?: string; // Reason if not showing (e.g., "Hotel breakfast")
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
 * Parse time string to minutes since midnight
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

/**
 * Check if a time falls within a range
 */
function isTimeBetween(time: string, start: string, end: string): boolean {
  const t = timeToMinutes(time);
  const s = timeToMinutes(start);
  const e = timeToMinutes(end);
  return t >= s && t <= e;
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

  // Parse meal plan from dayInfo if available
  let mealPlan: MealPlan | null = null;
  if (dayInfo?.meals) {
    try {
      mealPlan = JSON.parse(dayInfo.meals) as MealPlan;
    } catch {
      mealPlan = null;
    }
  }

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
 * Get meal slot info for a specific meal
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
  if (planNote) {
    const lowerNote = planNote.toLowerCase();

    // Skip if meal is at hotel
    if (lowerNote.includes('hotel') && meal === 'breakfast') {
      return {
        meal,
        suggestedTime: defaultTime,
        showOptions: false,
        reason: 'Hotel breakfast included',
      };
    }

    // Skip if included with ryokan
    if (lowerNote.includes('ryokan') || lowerNote.includes('yoshimatsu')) {
      return {
        meal,
        suggestedTime: defaultTime,
        showOptions: false,
        reason: 'Included with accommodation',
      };
    }

    // Skip if explicitly noted as not needed
    if (lowerNote.includes('skip') || lowerNote.includes('not needed')) {
      return null;
    }
  }

  // Check for Hakone ryokan days (days 7-8 have included dinner and breakfast)
  if (dayNumber === 7 || dayNumber === 8) {
    if (meal === 'dinner' && dayNumber === 7) {
      return {
        meal,
        suggestedTime: '18:00',
        showOptions: false,
        reason: 'Ryokan dinner included',
      };
    }
    if (meal === 'breakfast' && dayNumber === 8) {
      return {
        meal,
        suggestedTime: '08:00',
        showOptions: false,
        reason: 'Ryokan breakfast included',
      };
    }
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

  // Time ranges for each meal
  const mealRanges: Record<MealType, { start: string; end: string }> = {
    breakfast: { start: '07:00', end: '10:00' },
    lunch: { start: '11:30', end: '14:00' },
    dinner: { start: '17:30', end: '21:00' },
    snack: { start: '14:00', end: '17:00' },
    afternoon: { start: '14:00', end: '17:00' },
  };

  const range = mealRanges[meal];

  // Find gaps in activities within the meal time range
  const sortedActivities = [...activities].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  // Check if there's a food activity already scheduled in this range
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
  const totalMinutes = timeToMinutes(time) + minutes;
  const hours = Math.floor(totalMinutes / 60) % 24;
  const mins = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
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
      if (
        lowerNote.includes('hotel') ||
        lowerNote.includes('ryokan') ||
        lowerNote.includes('yoshimatsu') ||
        lowerNote.includes('included')
      ) {
        return false;
      }
    }
  }

  // Special handling for ryokan days
  if (dayNumber === 7 && meal === 'dinner') {
    return false; // Ryokan dinner on day 7
  }
  if (dayNumber === 8 && meal === 'breakfast') {
    return false; // Ryokan breakfast on day 8
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
