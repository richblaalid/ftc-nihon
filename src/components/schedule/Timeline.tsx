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

/**
 * Format time for display (HH:MM to h:mm AM/PM)
 */
function formatTimeDisplay(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  if (hours === undefined || minutes === undefined) return time;
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${suffix}`;
}

/**
 * Current time indicator component
 */
function NowIndicator({ time }: { time: string }) {
  return (
    <div className="relative flex items-center gap-2 py-2" aria-label={`Current time: ${formatTimeDisplay(time)}`}>
      <div className="flex items-center gap-2 rounded-full bg-primary px-2 py-0.5">
        <span className="h-2 w-2 animate-pulse rounded-full bg-white" aria-hidden="true" />
        <span className="text-xs font-medium text-white">Now</span>
      </div>
      <div className="flex-1 h-px bg-primary" aria-hidden="true" />
      <span className="text-xs font-medium text-primary">{formatTimeDisplay(time)}</span>
    </div>
  );
}

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

/**
 * Wrapper component for RestaurantOptionsCard that fetches its own data
 */
function MealSlotCard({ dayNumber, meal }: { dayNumber: number; meal: MealType }) {
  const options = useRestaurantOptionsForMeal(dayNumber, meal);
  const selection = useMealSelection(dayNumber, meal);
  const selectedRestaurant = useSelectedRestaurant(dayNumber, meal);

  // Loading state
  if (options === undefined) {
    return null;
  }

  // No options available for this meal
  if (!options.primary && options.alternatives.length === 0 && !options.isIncluded) {
    return null;
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
 * Get activity end time based on start time and duration
 */
function getActivityEndTime(activity: ActivityWithTransit): string {
  if (!activity.durationMinutes) return activity.startTime;

  const [hours, mins] = activity.startTime.split(':').map(Number);
  if (hours === undefined || mins === undefined) return activity.startTime;

  const endDate = new Date();
  endDate.setHours(hours, mins + activity.durationMinutes, 0, 0);
  return endDate.toTimeString().slice(0, 5);
}

/**
 * Parse time string to minutes since midnight
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

/**
 * Get meal slots that should appear in a specific period
 */
function getMealSlotsForPeriod(
  mealSlots: MealSlot[],
  period: 'morning' | 'afternoon' | 'evening'
): MealSlot[] {
  const periodRanges = {
    morning: { start: 0, end: 12 * 60 },
    afternoon: { start: 12 * 60, end: 17 * 60 },
    evening: { start: 17 * 60, end: 24 * 60 },
  };

  const range = periodRanges[period];
  return mealSlots.filter((slot) => {
    const minutes = timeToMinutes(slot.suggestedTime);
    return minutes >= range.start && minutes < range.end;
  });
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

  return (
    <div className="flex flex-col gap-6">
      {(['morning', 'afternoon', 'evening'] as const).map((period) => {
        const periodActivities = grouped[period];
        const periodMealSlots = getMealSlotsForPeriod(mealSlots, period);

        // Skip periods with no activities and no meal slots
        if (periodActivities.length === 0 && periodMealSlots.length === 0) return null;

        return (
          <div key={period}>
            {/* Period header */}
            <h3 className="mb-3 text-sm font-medium text-foreground-tertiary">
              {PERIOD_LABELS[period]}
            </h3>

            {/* Activities and meal slots in this period */}
            <ol className="flex flex-col gap-3 list-none">
              {periodActivities.map((activity, index) => {
                const state = getActivityState(activity, currentActivityId);
                const isCurrent = state === 'current';

                // Check if we should show the "now" indicator before this activity
                const prevActivity = periodActivities[index - 1];
                const prevEndTime = prevActivity
                  ? getActivityEndTime(prevActivity)
                  : period === 'morning' ? '00:00' : period === 'afternoon' ? '12:00' : '17:00';

                const showNowBefore =
                  !currentActivityId && // Only show if no activity is current
                  currentTime >= prevEndTime &&
                  currentTime < activity.startTime;

                // Check for meal slots that should appear before this activity
                const activityStartMinutes = timeToMinutes(activity.startTime);
                const prevEndMinutes = timeToMinutes(prevEndTime);
                const mealSlotsBefore = periodMealSlots.filter((slot) => {
                  const slotMinutes = timeToMinutes(slot.suggestedTime);
                  return slotMinutes >= prevEndMinutes && slotMinutes < activityStartMinutes;
                });

                return (
                  <li
                    key={activity.id}
                    ref={isCurrent ? currentRef : undefined}
                  >
                    {showNowBefore && (
                      <div ref={nowRef} className="mb-3">
                        <NowIndicator time={currentTime} />
                      </div>
                    )}
                    {/* Meal slots before this activity */}
                    {mealSlotsBefore.map((slot) => (
                      <div key={`meal-${slot.meal}`} className="mb-3">
                        {slot.showOptions ? (
                          <MealSlotCard dayNumber={dayNumber} meal={slot.meal} />
                        ) : (
                          <div className="card border-l-4 border-category-food/30 bg-category-food/5">
                            <p className="text-sm text-foreground-secondary">
                              {slot.reason}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                    <ActivityCard activity={activity} state={state} />
                  </li>
                );
              })}
              {/* Meal slots after the last activity in this period */}
              {(() => {
                const lastActivity = periodActivities[periodActivities.length - 1];
                const lastEndTime = lastActivity
                  ? getActivityEndTime(lastActivity)
                  : period === 'morning' ? '00:00' : period === 'afternoon' ? '12:00' : '17:00';
                const lastEndMinutes = timeToMinutes(lastEndTime);
                const periodEndMinutes =
                  period === 'morning' ? 12 * 60 : period === 'afternoon' ? 17 * 60 : 24 * 60;

                const mealSlotsAfter = periodMealSlots.filter((slot) => {
                  const slotMinutes = timeToMinutes(slot.suggestedTime);
                  return slotMinutes >= lastEndMinutes && slotMinutes < periodEndMinutes;
                });

                return mealSlotsAfter.map((slot) => (
                  <li key={`meal-after-${slot.meal}`}>
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
                ));
              })()}
            </ol>
          </div>
        );
      })}
    </div>
  );
}
