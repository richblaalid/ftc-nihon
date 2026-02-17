'use client';

import { useMemo, useRef, useCallback } from 'react';
import { useActivities, useAllDayInfo, useCurrentDayNumber } from '@/db/hooks';
import { ActivityListItem } from './ActivityListItem';
import type { Activity, DayInfo } from '@/types/database';
import { getJapanTime } from '@/lib/time-utils';

interface DaySection {
  dayInfo: DayInfo;
  activities: Activity[];
}

/**
 * Format date for display: "Sat Mar 7"
 */
function formatDateCompact(date: string): string {
  const d = new Date(date + 'T12:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Determine activity state based on current time
 */
function getActivityState(
  activity: Activity,
  currentDayNumber: number | null
): 'upcoming' | 'current' | 'completed' {
  if (currentDayNumber === null) return 'upcoming';

  // Different day
  if (activity.dayNumber < currentDayNumber) return 'completed';
  if (activity.dayNumber > currentDayNumber) return 'upcoming';

  // Same day - check time
  const japanTime = getJapanTime(new Date());
  const currentMinutes = japanTime.hours * 60 + japanTime.minutes;

  const [actHours, actMinutes] = activity.startTime.split(':').map(Number);
  if (actHours === undefined || actMinutes === undefined) return 'upcoming';

  const activityStartMinutes = actHours * 60 + actMinutes;
  const activityEndMinutes = activityStartMinutes + (activity.durationMinutes || 60);

  if (currentMinutes < activityStartMinutes) return 'upcoming';
  if (currentMinutes >= activityStartMinutes && currentMinutes < activityEndMinutes) {
    return 'current';
  }
  return 'completed';
}

interface AllDaysViewProps {
  /** Ref map for day sections, used for scroll-to navigation */
  daySectionRefs?: React.MutableRefObject<Map<number, HTMLDivElement>>;
}

/**
 * Full itinerary view showing all days in a compact list format.
 * Optimized for quick scanning and printing.
 */
export function AllDaysView({ daySectionRefs }: AllDaysViewProps) {
  const activities = useActivities();
  const dayInfos = useAllDayInfo();
  const currentDayNumber = useCurrentDayNumber();
  const internalRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Use provided refs or internal refs
  const refs = daySectionRefs ?? internalRefs;

  // Group activities by day
  const daySections = useMemo((): DaySection[] => {
    if (!activities || !dayInfos) return [];

    const activityMap = new Map<number, Activity[]>();
    for (const activity of activities) {
      const existing = activityMap.get(activity.dayNumber) ?? [];
      existing.push(activity);
      activityMap.set(activity.dayNumber, existing);
    }

    // Sort activities within each day by startTime
    for (const dayActivities of activityMap.values()) {
      dayActivities.sort((a, b) => a.startTime.localeCompare(b.startTime));
    }

    return dayInfos
      .sort((a, b) => a.dayNumber - b.dayNumber)
      .map((dayInfo) => ({
        dayInfo,
        activities: activityMap.get(dayInfo.dayNumber) ?? [],
      }));
  }, [activities, dayInfos]);

  // Handle printing
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Register section ref
  const setSectionRef = useCallback(
    (dayNumber: number, element: HTMLDivElement | null) => {
      if (element) {
        refs.current.set(dayNumber, element);
      } else {
        refs.current.delete(dayNumber);
      }
    },
    [refs]
  );

  if (!activities || !dayInfos) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-foreground-secondary">Loading itinerary...</div>
      </div>
    );
  }

  return (
    <div className="all-days-view">
      {/* Print button - hidden in print */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-background/95 px-4 py-3 backdrop-blur print:hidden">
        <span className="text-sm text-foreground-secondary">
          {activities.length} activities across {daySections.length} days
        </span>
        <button
          onClick={handlePrint}
          className="btn-secondary flex items-center gap-2 text-sm"
          aria-label="Print itinerary"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
          Print
        </button>
      </div>

      {/* Day sections */}
      <div className="divide-y divide-border">
        {daySections.map(({ dayInfo, activities: dayActivities }) => (
          <div
            key={dayInfo.dayNumber}
            ref={(el) => setSectionRef(dayInfo.dayNumber, el)}
            id={`day-${dayInfo.dayNumber}`}
            className="print:break-inside-avoid"
          >
            {/* Day header */}
            <div
              className={`sticky top-12 z-[5] border-b border-border bg-surface px-4 py-2 print:static print:bg-transparent ${
                currentDayNumber === dayInfo.dayNumber
                  ? 'bg-primary/5 dark:bg-primary/10'
                  : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-foreground-tertiary">
                    Day {dayInfo.dayNumber}
                  </span>
                  <span className="font-semibold text-foreground">{dayInfo.title}</span>
                </div>
                <span className="text-sm text-foreground-secondary">
                  {formatDateCompact(dayInfo.date)} · {dayInfo.location}
                </span>
              </div>
            </div>

            {/* Activities */}
            {dayActivities.length > 0 ? (
              <div className="divide-y divide-border/50">
                {dayActivities.map((activity) => (
                  <ActivityListItem
                    key={activity.id}
                    activity={{ ...activity, transit: null }}
                    state={getActivityState(activity, currentDayNumber)}
                  />
                ))}
              </div>
            ) : (
              <div className="px-4 py-4 text-sm italic text-foreground-tertiary">
                No scheduled activities - travel or guided tour day
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
