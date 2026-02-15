'use client';

import Link from 'next/link';
import { useNextActivityWithTransit } from '@/db/hooks';
import { formatTime, getTimeUntil } from '@/lib/time-utils';
import type { Activity } from '@/types/database';

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

export function NextWidget() {
  const nextActivity = useNextActivityWithTransit();

  // Loading state
  if (nextActivity === undefined) {
    return (
      <div className="card animate-pulse">
        <div className="h-4 w-16 rounded bg-background-secondary" />
        <div className="mt-2 h-6 w-40 rounded bg-background-secondary" />
        <div className="mt-2 h-4 w-24 rounded bg-background-secondary" />
      </div>
    );
  }

  // No next activity
  if (nextActivity === null) {
    return (
      <div className="card">
        <span className="text-xs font-medium uppercase tracking-wide text-foreground-tertiary">
          Next
        </span>
        <h3 className="mt-1 text-xl font-semibold text-foreground">No more activities today</h3>
        <p className="mt-1 text-sm text-foreground-secondary">Enjoy your free time!</p>
      </div>
    );
  }

  const hasTransit = nextActivity.transit && nextActivity.transit.leaveBy;

  return (
    <Link
      href={`/schedule/${nextActivity.id}`}
      className="card relative block overflow-hidden transition-all duration-fast active:scale-[0.98] hover:shadow-lg"
    >
      {/* Category accent bar */}
      <div
        className={`absolute left-0 top-0 h-full w-1.5 ${getCategoryColor(nextActivity.category)}`}
      />

      <div className="flex items-start justify-between pl-3">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-foreground-tertiary">
              Next
            </span>
            <span className="text-xs text-foreground-tertiary">{getTimeUntil(nextActivity.startTime)}</span>
          </div>

          {/* Activity name */}
          <h3 className="mt-1 text-xl font-semibold text-foreground">{nextActivity.name}</h3>

          {/* Start time */}
          <p className="mt-1 text-foreground-secondary">
            {formatTime(nextActivity.startTime)}
            {nextActivity.locationName && ` · ${nextActivity.locationName}`}
          </p>

          {/* Transit info - Leave By time */}
          {hasTransit && nextActivity.transit && (
            <div className="mt-3 rounded-lg bg-background-secondary p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Leave by</span>
                <span className="text-lg font-bold text-primary">
                  {formatTime(nextActivity.transit.leaveBy)}
                </span>
              </div>

              {/* Transit summary */}
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-foreground-tertiary">
                {nextActivity.transit.walkToStationMinutes && (
                  <span>🚶 {nextActivity.transit.walkToStationMinutes}min walk</span>
                )}
                {nextActivity.transit.trainLine && (
                  <span>🚃 {nextActivity.transit.trainLine}</span>
                )}
                {nextActivity.transit.travelMinutes && (
                  <span>⏱ {nextActivity.transit.travelMinutes}min travel</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Chevron indicator */}
        <span className="text-foreground-tertiary" aria-hidden="true">›</span>
      </div>
    </Link>
  );
}
