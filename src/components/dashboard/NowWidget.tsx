'use client';

import { useEffect, useState, useMemo } from 'react';
import { useCurrentActivity } from '@/db/hooks';
import type { Activity } from '@/types/database';

/**
 * Calculate time remaining for an activity
 */
function getTimeRemaining(activity: Activity): { minutes: number; text: string } | null {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5);

  // Calculate end time
  let endTime: string;
  if (activity.durationMinutes) {
    const [hours, mins] = activity.startTime.split(':').map(Number);
    if (hours === undefined || mins === undefined) return null;

    const endDate = new Date();
    endDate.setHours(hours, mins + activity.durationMinutes, 0, 0);
    endTime = endDate.toTimeString().slice(0, 5);
  } else {
    // Default to 1 hour if no duration
    const [hours, mins] = activity.startTime.split(':').map(Number);
    if (hours === undefined || mins === undefined) return null;

    const endDate = new Date();
    endDate.setHours(hours, mins + 60, 0, 0);
    endTime = endDate.toTimeString().slice(0, 5);
  }

  // Calculate remaining minutes
  const [endH, endM] = endTime.split(':').map(Number);
  const [nowH, nowM] = currentTime.split(':').map(Number);

  if (endH === undefined || endM === undefined || nowH === undefined || nowM === undefined) {
    return null;
  }

  const endMinutes = endH * 60 + endM;
  const nowMinutes = nowH * 60 + nowM;
  const remaining = endMinutes - nowMinutes;

  if (remaining <= 0) return null;

  if (remaining < 60) {
    return { minutes: remaining, text: `${remaining}m left` };
  }

  const hours = Math.floor(remaining / 60);
  const minutes = remaining % 60;
  return {
    minutes: remaining,
    text: minutes > 0 ? `${hours}h ${minutes}m left` : `${hours}h left`,
  };
}

/**
 * Get category color class
 */
function getCategoryColor(category: Activity['category']): string {
  const colors: Record<Activity['category'], string> = {
    food: 'bg-category-food',
    temple: 'bg-category-temple',
    shopping: 'bg-category-shopping',
    transit: 'bg-category-transit',
    activity: 'bg-category-activity',
    hotel: 'bg-category-hotel',
  };
  return colors[category];
}

export function NowWidget() {
  const currentActivity = useCurrentActivity();

  // Tick counter to trigger recalculation every minute
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  // Derive time remaining from activity and current time (via tick)
  const timeRemaining = useMemo(() => {
    if (!currentActivity) return null;
    // tick is used to force recalculation
    void tick;
    return getTimeRemaining(currentActivity);
  }, [currentActivity, tick]);

  // Loading state
  if (currentActivity === undefined) {
    return (
      <div className="card animate-pulse">
        <div className="h-4 w-16 rounded bg-background-secondary" />
        <div className="mt-2 h-8 w-48 rounded bg-background-secondary" />
        <div className="mt-2 h-4 w-32 rounded bg-background-secondary" />
      </div>
    );
  }

  // No current activity (free time)
  if (currentActivity === null) {
    return (
      <div className="card">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-foreground-tertiary">
            Now
          </span>
        </div>
        <h2 className="mt-1 text-2xl font-semibold text-foreground">Free Time</h2>
        <p className="mt-1 text-foreground-secondary">No scheduled activity right now</p>
      </div>
    );
  }

  return (
    <div className="card relative overflow-hidden">
      {/* Category accent bar */}
      <div
        className={`absolute left-0 top-0 h-full w-1.5 ${getCategoryColor(currentActivity.category)}`}
      />

      <div className="pl-3">
        {/* Header with NOW label and time remaining */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-foreground-tertiary">
            Now
          </span>
          {timeRemaining && (
            <span className="rounded-full bg-background-secondary px-2 py-0.5 text-xs font-medium text-foreground-secondary">
              {timeRemaining.text}
            </span>
          )}
        </div>

        {/* Activity name */}
        <h2 className="mt-1 text-2xl font-semibold text-foreground">{currentActivity.name}</h2>

        {/* Location */}
        {currentActivity.locationName && (
          <p className="mt-1 text-foreground-secondary">{currentActivity.locationName}</p>
        )}

        {/* Time */}
        <p className="mt-2 text-sm text-foreground-tertiary">
          Started at {currentActivity.startTime}
          {currentActivity.durationMinutes && ` · ${currentActivity.durationMinutes}min`}
        </p>
      </div>
    </div>
  );
}
