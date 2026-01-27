'use client';

import { useEffect, useRef, useState } from 'react';
import type { ActivityWithTransit, MealType } from '@/types/database';
import { ActivityCard } from './ActivityCard';
import { RestaurantOptionsCard } from '@/components/restaurants/RestaurantOptionsCard';
import {
  useDayInfo,
  useRestaurantOptionsForMeal,
  useMealSelection,
  useSelectedRestaurant,
} from '@/db/hooks';
import { getMealSlotsForDay, type MealSlot } from '@/lib/meal-slots';

interface TimelineProps {
  activities: ActivityWithTransit[];
  currentActivityId?: string | null;
}

/**
 * Get activity state based on current time
 */
function getActivityState(
  activity: ActivityWithTransit,
  currentActivityId: string | null | undefined
): 'current' | 'completed' | 'upcoming' {
  if (activity.id === currentActivityId) {
    return 'current';
  }

  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5);

  // Calculate activity end time
  let endTime = activity.startTime;
  if (activity.durationMinutes) {
    const [hours, mins] = activity.startTime.split(':').map(Number);
    if (hours !== undefined && mins !== undefined) {
      const endDate = new Date();
      endDate.setHours(hours, mins + activity.durationMinutes, 0, 0);
      endTime = endDate.toTimeString().slice(0, 5);
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
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  });

  // Get day number from activities
  const dayNumber = activities[0]?.dayNumber ?? 1;

  // Get day info for meal plan
  const dayInfo = useDayInfo(dayNumber);

  // Calculate meal slots for this day
  const mealSlots = getMealSlotsForDay(dayNumber, activities, dayInfo ?? null);

  // Update current time every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toTimeString().slice(0, 5));
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

  // Create a combined list of activities and meal slots, sorted by time
  type TimelineItem =
    | { type: 'activity'; activity: ActivityWithTransit; state: 'current' | 'completed' | 'upcoming' }
    | { type: 'meal'; slot: MealSlot };

  const timelineItems: TimelineItem[] = [];

  // Add all activities
  for (const activity of activities) {
    const state = getActivityState(activity, currentActivityId);
    timelineItems.push({ type: 'activity', activity, state });
  }

  // Add all meal slots
  for (const slot of mealSlots) {
    timelineItems.push({ type: 'meal', slot });
  }

  // Sort by time
  timelineItems.sort((a, b) => {
    const timeA = a.type === 'activity' ? a.activity.startTime : a.slot.suggestedTime;
    const timeB = b.type === 'activity' ? b.activity.startTime : b.slot.suggestedTime;
    return timeToMinutes(timeA) - timeToMinutes(timeB);
  });

  // Group by period
  const groupedItems: Record<'morning' | 'afternoon' | 'evening', TimelineItem[]> = {
    morning: [],
    afternoon: [],
    evening: [],
  };

  for (const item of timelineItems) {
    const time = item.type === 'activity' ? item.activity.startTime : item.slot.suggestedTime;
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
                } else {
                  const { slot } = item;
                  return (
                    <li key={`meal-${slot.meal}`}>
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
