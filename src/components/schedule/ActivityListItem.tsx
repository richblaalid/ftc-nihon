'use client';

import type { ActivityWithTransit, ActivityCategory } from '@/types/database';
import { getCategoryBgClass } from '@/components/ui/CategoryIcon';

type ActivityState = 'upcoming' | 'current' | 'completed';

interface ActivityListItemProps {
  activity: ActivityWithTransit;
  state?: ActivityState;
}

const CATEGORY_ICONS: Record<ActivityCategory, string> = {
  food: '🍜',
  temple: '⛩️',
  shopping: '🛍️',
  transit: '🚃',
  activity: '🎯',
  hotel: '🏨',
};

/**
 * Format time for display (24h format, compact)
 */
function formatTimeCompact(time: string): string {
  return time.slice(0, 5); // "09:00"
}

/**
 * Format duration for display (compact)
 */
function formatDurationCompact(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h${mins}m` : `${hours}h`;
}

/**
 * Compact activity list item for All Days view.
 * Height: ~48-56px (vs ~100px for ActivityCard)
 */
export function ActivityListItem({
  activity,
  state = 'upcoming',
}: ActivityListItemProps) {
  const isCompleted = state === 'completed';
  const isCurrent = state === 'current';

  return (
    <div
      className={`relative flex items-center gap-3 py-2 px-3 ${
        isCompleted ? 'opacity-50' : ''
      } ${isCurrent ? 'bg-primary/5' : ''}`}
      data-testid="activity-list-item"
    >
      {/* Category accent bar */}
      <div
        className={`absolute left-0 top-0 h-full w-1 ${getCategoryBgClass(activity.category)}`}
      />

      {/* Time */}
      <span className="w-12 shrink-0 font-mono text-sm text-foreground-secondary">
        {formatTimeCompact(activity.startTime)}
      </span>

      {/* Category icon */}
      <span className="w-5 shrink-0 text-center text-base" role="img" aria-hidden="true">
        {CATEGORY_ICONS[activity.category]}
      </span>

      {/* Name and metadata */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={`truncate font-medium ${
              isCompleted ? 'text-foreground-secondary' : 'text-foreground'
            }`}
          >
            {activity.name}
          </span>
          {isCurrent && (
            <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-primary" />
          )}
        </div>
        {(activity.locationName || activity.durationMinutes) && (
          <div className="flex items-center gap-1 text-xs text-foreground-tertiary">
            {activity.locationName && (
              <span className="truncate">{activity.locationName}</span>
            )}
            {activity.locationName && activity.durationMinutes && (
              <span>·</span>
            )}
            {activity.durationMinutes && (
              <span className="shrink-0">
                {formatDurationCompact(activity.durationMinutes)}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
