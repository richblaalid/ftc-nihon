'use client';

import { useNextActivityWithTransit } from '@/db/hooks';
import type { Activity } from '@/types/database';

/**
 * Format time for display (convert 24h to 12h)
 */
function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  if (hours === undefined || minutes === undefined) return time;

  const suffix = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${suffix}`;
}

/**
 * Calculate time until activity starts
 */
function getTimeUntil(startTime: string): string {
  const now = new Date();
  const [startH, startM] = startTime.split(':').map(Number);
  const [nowH, nowM] = [now.getHours(), now.getMinutes()];

  if (startH === undefined || startM === undefined) return '';

  let diffMinutes = startH * 60 + startM - (nowH * 60 + nowM);

  // If negative, it's tomorrow
  if (diffMinutes < 0) {
    diffMinutes += 24 * 60;
  }

  if (diffMinutes < 60) {
    return `in ${diffMinutes}m`;
  }

  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  if (minutes === 0) {
    return `in ${hours}h`;
  }

  return `in ${hours}h ${minutes}m`;
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
    <div className="card relative overflow-hidden">
      {/* Category accent bar */}
      <div
        className={`absolute left-0 top-0 h-full w-1.5 ${getCategoryColor(nextActivity.category)}`}
      />

      <div className="pl-3">
        {/* Header */}
        <div className="flex items-center justify-between">
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
    </div>
  );
}
