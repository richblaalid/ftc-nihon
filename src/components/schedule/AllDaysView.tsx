'use client';

/**
 * AllDaysView - Full itinerary view showing all days in compact list format
 *
 * Displays entire 16-day trip in a scrollable list with day section headers.
 * Optimized for quick scanning rather than detailed exploration.
 */

import { useRef, useEffect, useCallback } from 'react';
import { useActivities, useAllDayInfo, useCurrentDayNumber, useCurrentActivity } from '@/db/hooks';
import { ActivityListItem } from './ActivityListItem';
import { TRIP_DAYS } from '@/types/database';
import type { DayInfo, Activity } from '@/types/database';

interface AllDaysViewProps {
  /** Scroll to this day when set */
  scrollToDay?: number | null;
  /** Callback when scroll completes */
  onScrollComplete?: () => void;
  /** Offset from top for sticky headers (to account for page header height) */
  stickyTopOffset?: number;
}

export function AllDaysView({ scrollToDay, onScrollComplete, stickyTopOffset = 0 }: AllDaysViewProps) {
  const allActivities = useActivities();
  const allDayInfo = useAllDayInfo();
  const currentDayNumber = useCurrentDayNumber();
  const currentActivity = useCurrentActivity();
  const daySectionRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Group activities by day
  const activitiesByDay = useCallback(() => {
    if (!allActivities) return new Map<number, Activity[]>();

    const grouped = new Map<number, Activity[]>();
    for (let day = 0; day < TRIP_DAYS; day++) {
      grouped.set(day, []);
    }

    for (const activity of allActivities) {
      const existing = grouped.get(activity.dayNumber) ?? [];
      existing.push(activity);
      grouped.set(activity.dayNumber, existing);
    }

    return grouped;
  }, [allActivities]);

  // Get day info map
  const dayInfoMap = useCallback(() => {
    if (!allDayInfo) return new Map<number, DayInfo>();
    return new Map(allDayInfo.map((d) => [d.dayNumber, d]));
  }, [allDayInfo]);

  // Scroll to day section
  useEffect(() => {
    if (scrollToDay !== null && scrollToDay !== undefined) {
      const element = daySectionRefs.current.get(scrollToDay);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        onScrollComplete?.();
      }
    }
  }, [scrollToDay, onScrollComplete]);

  // Determine activity state
  const getActivityState = (activity: Activity): 'upcoming' | 'current' | 'completed' => {
    if (activity.id === currentActivity?.id) return 'current';
    if (activity.dayNumber < (currentDayNumber ?? 99)) return 'completed';
    if (activity.dayNumber === currentDayNumber) {
      // Same day - check time
      const now = new Date();
      const [hours, minutes] = activity.startTime.split(':').map(Number);
      if (hours !== undefined && minutes !== undefined) {
        const activityTime = hours * 60 + minutes;
        const currentTime = now.getHours() * 60 + now.getMinutes();
        if (activityTime < currentTime) return 'completed';
      }
    }
    return 'upcoming';
  };

  // Format date for header
  const formatDate = (dateStr: string): string => {
    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year || !month || !day) return dateStr;
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const handlePrint = () => {
    window.print();
  };

  if (!allActivities || !allDayInfo) {
    return (
      <div className="flex flex-col gap-4 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-8 w-48 rounded bg-background-secondary mb-2" />
            <div className="space-y-2">
              <div className="h-12 rounded bg-background-secondary" />
              <div className="h-12 rounded bg-background-secondary" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const grouped = activitiesByDay();
  const infoMap = dayInfoMap();

  return (
    <div className="all-days-view">
      {/* Print button */}
      <div className="flex justify-end mb-4" data-print-hide>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-foreground-secondary
                     bg-background-secondary rounded-lg hover:bg-background-tertiary transition-colors"
        >
          <span>Print</span>
        </button>
      </div>

      {/* Day sections */}
      <div className="space-y-6">
        {Array.from({ length: TRIP_DAYS }, (_, day) => {
          const activities = grouped.get(day) ?? [];
          const dayInfo = infoMap.get(day);

          if (activities.length === 0) return null;

          return (
            <div
              key={day}
              ref={(el) => {
                if (el) daySectionRefs.current.set(day, el);
              }}
              style={{ scrollMarginTop: stickyTopOffset + 16 }}
            >
              {/* Day header - sticky below page header */}
              <div
                className="sticky z-10 bg-background/95 backdrop-blur-sm py-2 mb-2 border-b border-background-secondary"
                style={{ top: stickyTopOffset }}
              >
                <h3 className="text-sm font-bold text-foreground">
                  Day {day}: {dayInfo ? formatDate(dayInfo.date) : ''}
                  {dayInfo?.title && (
                    <span className="font-normal text-foreground-secondary ml-2">
                      — {dayInfo.title}
                    </span>
                  )}
                </h3>
                {dayInfo?.location && (
                  <p className="text-xs text-foreground-tertiary">{dayInfo.location}</p>
                )}
              </div>

              {/* Activities */}
              <div className="space-y-1.5">
                {activities.map((activity) => (
                  <ActivityListItem
                    key={activity.id}
                    activity={activity}
                    state={getActivityState(activity)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
