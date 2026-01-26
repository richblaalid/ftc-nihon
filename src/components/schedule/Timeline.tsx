'use client';

import { useEffect, useRef } from 'react';
import type { ActivityWithTransit } from '@/types/database';
import { ActivityCard } from './ActivityCard';

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

export function Timeline({ activities, currentActivityId }: TimelineProps) {
  const currentRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to current activity on mount
  useEffect(() => {
    if (currentRef.current) {
      currentRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentActivityId]);

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
        if (periodActivities.length === 0) return null;

        return (
          <div key={period}>
            {/* Period header */}
            <h3 className="mb-3 text-sm font-medium text-foreground-tertiary">
              {PERIOD_LABELS[period]}
            </h3>

            {/* Activities in this period */}
            <div className="flex flex-col gap-3">
              {periodActivities.map((activity) => {
                const state = getActivityState(activity, currentActivityId);
                const isCurrent = state === 'current';

                return (
                  <div
                    key={activity.id}
                    ref={isCurrent ? currentRef : undefined}
                  >
                    <ActivityCard activity={activity} state={state} />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
