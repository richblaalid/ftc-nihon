'use client';

import { useEffect, useRef, useState } from 'react';
import type { ActivityWithTransit, MealType, TransitSegment } from '@/types/database';
import { ActivityCard } from './ActivityCard';
import { TransitCard } from './TransitCard';
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
 * Wrapper component for RestaurantOptionsCard that fetches its own data
 */
function MealSlotCard({ dayNumber, meal }: { dayNumber: number; meal: MealType }) {
  const options = useRestaurantOptionsForMeal(dayNumber, meal);
  const selection = useMealSelection(dayNumber, meal);
  const selectedRestaurant = useSelectedRestaurant(dayNumber, meal);

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

  // No options available for this meal - still show the slot
  if (!options.primary && options.alternatives.length === 0 && !options.isIncluded) {
    return (
      <div className="card border-l-4 border-category-food/30 bg-category-food/5">
        <div className="flex items-center gap-3">
          <span className="text-xl" role="img" aria-label={MEAL_LABELS[meal]}>
            {MEAL_ICONS[meal]}
          </span>
          <div>
            <h4 className="font-medium text-foreground">{MEAL_LABELS[meal]}</h4>
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
    | { type: 'transit'; transit: TransitSegment; activityState: 'current' | 'completed' | 'upcoming' }
    | { type: 'meal'; slot: MealSlot; isPast: boolean }
    | { type: 'walk'; toActivity: string; activityState: 'current' | 'completed' | 'upcoming' };

  // First, collect activities and meals (NOT transit) and sort them by time
  const activitiesAndMeals: TimelineItem[] = [];

  for (const activity of activities) {
    const state = getActivityState(activity, currentActivityId, isViewingToday, todayStr);
    activitiesAndMeals.push({ type: 'activity', activity, state });
  }

  for (const slot of mealSlots) {
    activitiesAndMeals.push({ type: 'meal', slot, isPast: isViewingPastDay });
  }

  // Sort activities and meals by time
  activitiesAndMeals.sort((a, b) => {
    const getTime = (item: TimelineItem): string => {
      if (item.type === 'activity') return item.activity.startTime;
      return (item as { type: 'meal'; slot: MealSlot }).slot.suggestedTime;
    };
    return timeToMinutes(getTime(a)) - timeToMinutes(getTime(b));
  });

  // Now insert transit cards or walking indicators BEFORE their linked activities
  const timelineItems: TimelineItem[] = [];
  let prevActivityItem: TimelineItem | null = null;

  for (const item of activitiesAndMeals) {
    if (item.type === 'activity') {
      if (item.activity.transit && item.activity.transit.leaveBy) {
        // Insert transit card right before the activity it's linked to
        timelineItems.push({
          type: 'transit',
          transit: item.activity.transit,
          activityState: item.state,
        });
      } else if (prevActivityItem !== null) {
        // No transit segment - add walking indicator if not the first activity
        timelineItems.push({
          type: 'walk',
          toActivity: item.activity.name,
          activityState: item.state,
        });
      }
      prevActivityItem = item;
    }
    timelineItems.push(item);
  }

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

    if (item.type === 'transit' || item.type === 'walk') {
      // Transit/walk indicator should be in the same period as its linked activity (next item)
      const nextItem = timelineItems[i + 1];
      if (nextItem && nextItem.type === 'activity') {
        time = nextItem.activity.startTime;
      } else if (item.type === 'transit') {
        time = item.transit.leaveBy;
      } else {
        // Walk indicator fallback - use morning
        time = '08:00';
      }
    } else if (item.type === 'activity') {
      time = item.activity.startTime;
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
                  const { transit, activityState } = item;
                  const isTransitCompleted = activityState === 'completed';

                  return (
                    <li key={`transit-${transit.id}`}>
                      <TransitCard
                        transit={transit}
                        isViewingToday={isViewingToday}
                        isCompleted={isTransitCompleted}
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
                      {slot.showOptions ? (
                        <MealSlotCard dayNumber={dayNumber} meal={slot.meal} />
                      ) : (
                        <div className="card border-l-4 border-category-food/30 bg-category-food/5">
                          <p className="text-sm text-foreground-secondary">
                            {slot.reason}
                          </p>
                        </div>
                      )}
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
