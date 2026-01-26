'use client';

import { useEffect, useRef, useState } from 'react';
import type { ActivityWithTransit } from '@/types/database';
import { ActivityCard } from './ActivityCard';

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

export function Timeline({ activities, currentActivityId }: TimelineProps) {
  const currentRef = useRef<HTMLLIElement>(null);
  const nowRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState<string>(() => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  });

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
        if (periodActivities.length === 0) return null;

        return (
          <div key={period}>
            {/* Period header */}
            <h3 className="mb-3 text-sm font-medium text-foreground-tertiary">
              {PERIOD_LABELS[period]}
            </h3>

            {/* Activities in this period - using ol for screen reader list semantics */}
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
                    <ActivityCard activity={activity} state={state} />
                  </li>
                );
              })}
            </ol>
          </div>
        );
      })}
    </div>
  );
}
