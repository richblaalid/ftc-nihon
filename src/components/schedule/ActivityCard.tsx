'use client';

import Link from 'next/link';
import type { ActivityWithTransit } from '@/types/database';
import { CategoryIcon, getCategoryBgClass } from '@/components/ui/CategoryIcon';

type ActivityState = 'upcoming' | 'current' | 'completed';

interface ActivityCardProps {
  activity: ActivityWithTransit;
  state?: ActivityState;
  showTransit?: boolean;
}

/**
 * Format time for display (24h to 12h)
 */
function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  if (hours === undefined || minutes === undefined) return time;

  const suffix = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${suffix}`;
}

/**
 * Format duration for display
 */
function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Get state-based styles
 */
function getStateStyles(state: ActivityState): {
  card: string;
  text: string;
  muted: string;
} {
  switch (state) {
    case 'current':
      return {
        card: 'ring-2 ring-primary ring-offset-2 ring-offset-background',
        text: 'text-foreground',
        muted: 'text-foreground-secondary',
      };
    case 'completed':
      return {
        card: 'opacity-60',
        text: 'text-foreground-secondary',
        muted: 'text-foreground-tertiary',
      };
    case 'upcoming':
    default:
      return {
        card: '',
        text: 'text-foreground',
        muted: 'text-foreground-secondary',
      };
  }
}

export function ActivityCard({
  activity,
  state = 'upcoming',
  showTransit = true,
}: ActivityCardProps) {
  const styles = getStateStyles(state);
  const hasTransit = showTransit && activity.transit?.leaveBy;

  return (
    <Link
      href={`/schedule/${activity.id}`}
      data-testid="activity-card"
      className={`card relative block overflow-hidden transition-transform active:scale-[0.98] ${styles.card}`}
    >
      {/* Category accent bar */}
      <div
        className={`absolute left-0 top-0 h-full w-1.5 ${getCategoryBgClass(activity.category)}`}
      />

      <div className="pl-4">
        {/* Header: Time + Category icon */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${styles.muted}`}>
              {formatTime(activity.startTime)}
            </span>
            {activity.durationMinutes && (
              <span className="text-xs text-foreground-tertiary">
                · {formatDuration(activity.durationMinutes)}
              </span>
            )}
          </div>
          <CategoryIcon category={activity.category} size="sm" />
        </div>

        {/* Activity name */}
        <h3 className={`mt-1 text-lg font-semibold ${styles.text}`}>{activity.name}</h3>

        {/* Location */}
        {activity.locationName && (
          <p className={`mt-0.5 text-sm ${styles.muted}`}>{activity.locationName}</p>
        )}

        {/* Hard deadline indicator */}
        {activity.isHardDeadline && state !== 'completed' && (
          <div className="mt-2 inline-flex items-center gap-1 rounded bg-error/10 px-2 py-0.5 text-xs font-medium text-error">
            <span>⚠️</span>
            <span>Timed entry</span>
          </div>
        )}

        {/* Transit info - Leave By */}
        {hasTransit && activity.transit && state !== 'completed' && (
          <div className="mt-3 rounded-lg bg-background-secondary p-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground-secondary">Leave by</span>
              <span className="text-sm font-bold text-primary">
                {formatTime(activity.transit.leaveBy)}
              </span>
            </div>
            {activity.transit.trainLine && (
              <p className="mt-1 text-xs text-foreground-tertiary">
                🚃 {activity.transit.trainLine}
                {activity.transit.travelMinutes && ` · ${activity.transit.travelMinutes}min`}
              </p>
            )}
          </div>
        )}

        {/* Current activity indicator */}
        {state === 'current' && (
          <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            <span>Happening now</span>
          </div>
        )}
      </div>
    </Link>
  );
}
