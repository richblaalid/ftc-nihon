'use client';

import { useEffect, useRef, useState } from 'react';
import type { ActivityWithTransit, MealType, TransitSegment, TransitRenderType } from '@/types/database';
import { ActivityCard } from './ActivityCard';
import { TransitCard } from './TransitCard';
import { SimplifiedTransitCard } from './SimplifiedTransitCard';
import { WalkIndicator } from './WalkIndicator';
import { RestaurantOptionsCard } from '@/components/restaurants/RestaurantOptionsCard';
import {
  useDayInfo,
  useRestaurantOptionsForMeal,
  useMealSelection,
  useSelectedRestaurant,
} from '@/db/hooks';
import { getMealSlotsForDay, type MealSlot } from '@/lib/meal-slots';
import { getCurrentDate, getJapanDateString } from '@/lib/utils';
import { getJapanTimeString, parseTimeToMinutes, minutesToTimeString } from '@/lib/time-utils';

interface TimelineProps {
  activities: ActivityWithTransit[];
  currentActivityId?: string | null;
}

/**
 * Get activity state based on current time and date
 */
function getActivityState(
  activity: ActivityWithTransit,
  currentActivityId: string | null | undefined,
  isViewingToday: boolean,
  todayStr: string
): 'current' | 'completed' | 'upcoming' {
  if (activity.id === currentActivityId) {
    return 'current';
  }

  // If not viewing today, determine state by comparing activity date to today
  if (!isViewingToday) {
    // Past day = all completed, Future day = all upcoming
    if (activity.date < todayStr) {
      return 'completed';
    }
    return 'upcoming';
  }

  // Viewing today - compare times using Japan timezone
  const now = getCurrentDate();
  const currentTime = getJapanTimeString(now);

  // Calculate activity end time using shared utilities
  let endTime = activity.startTime;
  if (activity.durationMinutes) {
    const startMins = parseTimeToMinutes(activity.startTime);
    if (startMins !== null) {
      endTime = minutesToTimeString(startMins + activity.durationMinutes);
    }
  }

  // If current time is past the activity end, it's completed
  if (currentTime > endTime && activity.startTime < currentTime) {
    return 'completed';
  }

  return 'upcoming';
}

/**
 * Group activities by time period (morning, afternoon, evening)
 */
function getTimePeriod(time: string): 'morning' | 'afternoon' | 'evening' {
  const [hours] = time.split(':').map(Number);
  if (hours === undefined) return 'morning';

  if (hours < 12) return 'morning';
  if (hours < 17) return 'afternoon';
  return 'evening';
}

const PERIOD_LABELS = {
  morning: '🌅 Morning',
  afternoon: '☀️ Afternoon',
  evening: '🌙 Evening',
};

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
 * Determine the mode for SimplifiedTransitCard based on activity name
 */
function getSimplifiedMode(name: string): 'ropeway' | 'cable_car' | 'bus' | 'walk' | 'pirate_ship' {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('ropeway')) return 'ropeway';
  if (lowerName.includes('cable car') || lowerName.includes('funicular')) return 'cable_car';
  if (lowerName.includes('pirate') || lowerName.includes('ship') || lowerName.includes('boat')) return 'pirate_ship';
  if (lowerName.includes('bus')) return 'bus';
  if (lowerName.includes('walk')) return 'walk';
  // Default to cable_car for Hakone scenic transit
  return 'cable_car';
}

/**
 * Unified MealSlotCard component for schedule display
 *
 * Design Rules (see docs/meal-card-refactor-plan.md):
 * - One card per meal slot: exactly one card in timeline per meal
 * - Handles three display modes:
 *   1. Scheduled: Show activity name, location, tips (specific venue)
 *   2. Options: Show primary recommendation, "Choose" badge, tap to select
 *   3. Included: Show "Included with accommodation" text
 */
function MealSlotCard({
  dayNumber,
  slot,
}: {
  dayNumber: number;
  slot: MealSlot;
}) {
  const { meal, scheduledActivity, showOptions, reason } = slot;
  const options = useRestaurantOptionsForMeal(dayNumber, meal);
  const selection = useMealSelection(dayNumber, meal);
  const selectedRestaurant = useSelectedRestaurant(dayNumber, meal);

  // Case 1: Meal is included (ryokan, hotel breakfast) - no scheduled activity
  if (!showOptions && !scheduledActivity) {
    return (
      <div className="card border-l-4 border-category-food/30 bg-category-food/5">
        <div className="flex items-center gap-3">
          <span className="text-xl" role="img" aria-label={MEAL_LABELS[meal]} aria-hidden="true">
            {MEAL_ICONS[meal]}
          </span>
          <div>
            <h4 className="font-medium text-foreground">{MEAL_LABELS[meal]}</h4>
            <p className="text-sm text-foreground-secondary">{reason}</p>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Specific scheduled activity (e.g., "Tsukiji Market") - show activity details
  if (!showOptions && scheduledActivity) {
    return (
      <div className="card border-l-4 border-category-food bg-category-food/5">
        <div className="flex items-center gap-3">
          <span className="text-xl" role="img" aria-label={MEAL_LABELS[meal]} aria-hidden="true">
            {MEAL_ICONS[meal]}
          </span>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-foreground">
              {MEAL_LABELS[meal]}: {scheduledActivity.name}
            </h4>
            {scheduledActivity.locationName && (
              <p className="text-sm text-foreground-secondary truncate">
                📍 {scheduledActivity.locationName}
              </p>
            )}
            {scheduledActivity.tips && (
              <p className="text-xs text-foreground-tertiary mt-1 line-clamp-2">
                💡 {scheduledActivity.tips}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Case 3: Show restaurant options (either no scheduled activity or generic placeholder)
  // Loading state - show skeleton
  if (options === undefined) {
    return (
      <div className="card border-l-4 border-category-food/30 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-background-secondary rounded" />
          <div className="flex-1">
            <div className="h-4 w-20 bg-background-secondary rounded" />
            <div className="h-3 w-32 mt-1 bg-background-secondary rounded" />
          </div>
        </div>
      </div>
    );
  }

  // No options available for this meal - still show the slot with placeholder name if available
  if (!options.primary && options.alternatives.length === 0 && !options.isIncluded) {
    return (
      <div className="card border-l-4 border-category-food/30 bg-category-food/5">
        <div className="flex items-center gap-3">
          <span className="text-xl" role="img" aria-label={MEAL_LABELS[meal]} aria-hidden="true">
            {MEAL_ICONS[meal]}
          </span>
          <div>
            <h4 className="font-medium text-foreground">
              {scheduledActivity ? `${MEAL_LABELS[meal]}: ${scheduledActivity.name}` : MEAL_LABELS[meal]}
            </h4>
            <p className="text-sm text-foreground-tertiary">No restaurant options</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <RestaurantOptionsCard
      dayNumber={dayNumber}
      meal={meal}
      options={options}
      selection={selection ?? null}
      selectedRestaurant={selectedRestaurant ?? null}
    />
  );
}

/**
 * Parse time string to minutes since midnight
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

export function Timeline({ activities, currentActivityId }: TimelineProps) {
  const currentRef = useRef<HTMLLIElement>(null);
  const nowRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState<string>(() => {
    const now = getCurrentDate();
    return getJapanTimeString(now);
  });

  // Get day number from activities
  const dayNumber = activities[0]?.dayNumber ?? 1;

  // Get day info for meal plan
  const dayInfo = useDayInfo(dayNumber);

  // Calculate meal slots for this day
  const mealSlots = getMealSlotsForDay(dayNumber, activities, dayInfo ?? null);

  // Update current time every minute (using Japan timezone)
  useEffect(() => {
    const updateTime = () => {
      const now = getCurrentDate();
      setCurrentTime(getJapanTimeString(now));
    };

    // Update immediately and then every minute
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to current activity or now indicator on mount
  useEffect(() => {
    const scrollTarget = currentRef.current || nowRef.current;
    if (scrollTarget) {
      scrollTarget.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentActivityId, currentTime]);

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <span className="text-4xl">📅</span>
        <p className="mt-2 text-foreground-secondary">No activities scheduled for this day</p>
      </div>
    );
  }

  // Group activities by time period
  const grouped: Record<'morning' | 'afternoon' | 'evening', ActivityWithTransit[]> = {
    morning: [],
    afternoon: [],
    evening: [],
  };

  for (const activity of activities) {
    const period = getTimePeriod(activity.startTime);
    grouped[period].push(activity);
  }

  // Determine if we're viewing today's schedule (using Japan timezone)
  const todayStr = getJapanDateString(getCurrentDate());
  const viewingDate = activities[0]?.date ?? '';
  const isViewingToday = viewingDate === todayStr;

  // Determine if viewing a past day (for dimming meals)
  const isViewingPastDay = viewingDate < todayStr;

  // Create a combined list of activities, transit cards, meal slots, and walking indicators
  type TimelineItem =
    | { type: 'activity'; activity: ActivityWithTransit; state: 'current' | 'completed' | 'upcoming' }
    | { type: 'transit'; transit: TransitSegment; activityName: string; activityState: 'current' | 'completed' | 'upcoming' }
    | { type: 'simplified'; activity: ActivityWithTransit; state: 'current' | 'completed' | 'upcoming' }
    | { type: 'walk-activity'; activity: ActivityWithTransit; state: 'current' | 'completed' | 'upcoming' }
    | { type: 'meal'; slot: MealSlot; isPast: boolean }
    | { type: 'walk'; toActivity: string; activityState: 'current' | 'completed' | 'upcoming' };

  // Collect activity IDs that are "covered" by meal slots
  // These food activities will be rendered as part of the MealSlotCard, not separately
  const coveredActivityIds = new Set<string>();
  for (const slot of mealSlots) {
    if (slot.scheduledActivity) {
      coveredActivityIds.add(slot.scheduledActivity.id);
    }
  }

  // First, collect activities and meals, mapping them based on transitRenderType
  const activitiesAndMeals: TimelineItem[] = [];

  for (const activity of activities) {
    // Skip food activities that are covered by meal slots
    // They will be rendered as part of the unified MealSlotCard
    if (coveredActivityIds.has(activity.id)) {
      continue;
    }

    const state = getActivityState(activity, currentActivityId, isViewingToday, todayStr);
    const renderType = activity.transitRenderType;

    // Determine what type of item to render based on transitRenderType
    if (renderType === 'full') {
      // For 'full': Skip the ActivityCard but show the TransitCard if linked
      // This replaces the duplicate ActivityCard with just the transit information
      if (activity.transit && activity.transit.leaveBy) {
        activitiesAndMeals.push({
          type: 'transit',
          transit: activity.transit,
          activityName: activity.name,
          activityState: state,
        });
      }
      // Don't add an ActivityCard for 'full' transit activities
      continue;
    } else if (renderType === 'simplified') {
      // For 'simplified': render SimplifiedTransitCard
      activitiesAndMeals.push({ type: 'simplified', activity, state });
    } else if (renderType === 'walk') {
      // For 'walk': render WalkIndicator
      activitiesAndMeals.push({ type: 'walk-activity', activity, state });
    } else {
      // For 'keep', 'flight', or null: check if has linked transit segment
      if (activity.transit && activity.transit.leaveBy) {
        // Insert TransitCard BEFORE the activity
        activitiesAndMeals.push({
          type: 'transit',
          transit: activity.transit,
          activityName: activity.name,
          activityState: state,
        });
      }
      // Then add the activity itself
      activitiesAndMeals.push({ type: 'activity', activity, state });
    }
  }

  for (const slot of mealSlots) {
    activitiesAndMeals.push({ type: 'meal', slot, isPast: isViewingPastDay });
  }

  // Sort activities and meals by time
  activitiesAndMeals.sort((a, b) => {
    const getTime = (item: TimelineItem): string => {
      if (item.type === 'activity' || item.type === 'simplified' || item.type === 'walk-activity') {
        return item.activity.startTime;
      }
      if (item.type === 'transit') {
        return item.transit.leaveBy;
      }
      if (item.type === 'meal') {
        return item.slot.suggestedTime;
      }
      // Walk fallback
      return '08:00';
    };
    return timeToMinutes(getTime(a)) - timeToMinutes(getTime(b));
  });

  // Transit cards are now added directly in the item creation loop above
  // (no need to insert separately since transitRenderType='full' creates transit items directly)
  const timelineItems: TimelineItem[] = [...activitiesAndMeals];

  // Group by period - transit cards stay with their linked activity
  const groupedItems: Record<'morning' | 'afternoon' | 'evening', TimelineItem[]> = {
    morning: [],
    afternoon: [],
    evening: [],
  };

  for (let i = 0; i < timelineItems.length; i++) {
    const item = timelineItems[i];
    if (!item) continue;
    let time: string;

    if (item.type === 'transit') {
      time = item.transit.leaveBy;
    } else if (item.type === 'activity' || item.type === 'simplified' || item.type === 'walk-activity') {
      time = item.activity.startTime;
    } else if (item.type === 'walk') {
      // Walk indicator fallback - use morning
      time = '08:00';
    } else {
      time = item.slot.suggestedTime;
    }

    const period = getTimePeriod(time);
    groupedItems[period].push(item);
  }

  return (
    <div className="flex flex-col gap-6">
      {(['morning', 'afternoon', 'evening'] as const).map((period) => {
        const items = groupedItems[period];

        if (items.length === 0) return null;

        return (
          <div key={period}>
            {/* Period header */}
            <h3 className="mb-3 text-sm font-medium text-foreground-tertiary">
              {PERIOD_LABELS[period]}
            </h3>

            {/* Timeline items */}
            <ol className="flex flex-col gap-3 list-none">
              {items.map((item) => {
                if (item.type === 'activity') {
                  const { activity, state } = item;
                  const isCurrent = state === 'current';

                  return (
                    <li
                      key={activity.id}
                      ref={isCurrent ? currentRef : undefined}
                    >
                      <ActivityCard activity={activity} state={state} />
                    </li>
                  );
                } else if (item.type === 'transit') {
                  // Task 4.1 & 4.4: Render TransitCard with activity title (replaces ActivityCard)
                  const { transit, activityName, activityState } = item;
                  const isTransitCompleted = activityState === 'completed';

                  return (
                    <li key={`transit-${transit.id}`}>
                      <TransitCard
                        transit={transit}
                        isViewingToday={isViewingToday}
                        isCompleted={isTransitCompleted}
                        title={activityName}
                      />
                    </li>
                  );
                } else if (item.type === 'simplified') {
                  // Task 4.2: Render SimplifiedTransitCard for scenic/simple transit
                  const { activity, state } = item;
                  const isCompleted = state === 'completed';

                  // Determine mode from activity name/description
                  const mode = getSimplifiedMode(activity.name);

                  return (
                    <li key={activity.id}>
                      <SimplifiedTransitCard
                        title={activity.name}
                        duration={activity.durationMinutes ?? 30}
                        mode={mode}
                        coveredByPass={activity.transit?.coveredByPass}
                        startTime={activity.startTime}
                        isCompleted={isCompleted}
                      />
                    </li>
                  );
                } else if (item.type === 'walk-activity') {
                  // Task 4.3: Render WalkIndicator for short walks
                  const { activity, state } = item;
                  const isCompleted = state === 'completed';

                  return (
                    <li key={activity.id}>
                      <WalkIndicator
                        destination={activity.locationName ?? activity.name}
                        duration={activity.durationMinutes ?? undefined}
                        isCompleted={isCompleted}
                      />
                    </li>
                  );
                } else if (item.type === 'walk') {
                  const isCompleted = item.activityState === 'completed';

                  return (
                    <li
                      key={`walk-to-${item.toActivity}`}
                      className={`flex items-center gap-2 px-3 py-1.5 text-sm ${
                        isCompleted ? 'opacity-50' : 'text-foreground-secondary'
                      }`}
                    >
                      <span className="text-base">🚶</span>
                      <span>Walk to next location</span>
                    </li>
                  );
                } else {
                  const { slot, isPast } = item;
                  return (
                    <li key={`meal-${slot.meal}`} className={isPast ? 'opacity-60' : ''}>
                      <MealSlotCard dayNumber={dayNumber} slot={slot} />
                    </li>
                  );
                }
              })}
            </ol>
          </div>
        );
      })}
    </div>
  );
}
