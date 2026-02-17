'use client';

/**
 * ActivityListItem - Compact activity display for All Days view
 *
 * Shows activity in a single line with time, emoji, name, and location/duration.
 * Height ~50-60px for compact list display.
 */

import { CategoryIcon, getCategoryBgClass } from '@/components/ui';
import type { Activity } from '@/types/database';

interface ActivityListItemProps {
  activity: Activity;
  state?: 'upcoming' | 'current' | 'completed';
}

export function ActivityListItem({ activity, state = 'upcoming' }: ActivityListItemProps) {
  // Format time from HH:MM to display format
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    if (hours === undefined || minutes === undefined) return time;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Build location/duration string
  const buildSubtext = () => {
    const parts: string[] = [];
    if (activity.locationName) {
      parts.push(activity.locationName);
    }
    if (activity.durationMinutes) {
      const hours = Math.floor(activity.durationMinutes / 60);
      const mins = activity.durationMinutes % 60;
      if (hours > 0 && mins > 0) {
        parts.push(`${hours}h ${mins}m`);
      } else if (hours > 0) {
        parts.push(`${hours}h`);
      } else {
        parts.push(`${mins}m`);
      }
    }
    return parts.join(' · ');
  };

  const categoryBgClass = getCategoryBgClass(activity.category);
  const subtext = buildSubtext();

  return (
    <div
      className={`
        flex items-center gap-3 py-2.5 px-3 rounded-lg
        border-l-4 ${categoryBgClass.replace('bg-', 'border-')}
        bg-background-secondary/50
        ${state === 'completed' ? 'opacity-50' : ''}
        ${state === 'current' ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}
      `}
    >
      {/* Time */}
      <div className="w-16 shrink-0 text-xs font-medium text-foreground-secondary">
        {formatTime(activity.startTime)}
      </div>

      {/* Category icon */}
      <div className="shrink-0">
        <CategoryIcon category={activity.category} size="sm" />
      </div>

      {/* Name and subtext */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground truncate">
          {activity.name}
        </div>
        {subtext && (
          <div className="text-xs text-foreground-tertiary truncate">
            {subtext}
          </div>
        )}
      </div>

      {/* Current indicator */}
      {state === 'current' && (
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
      )}
    </div>
  );
}
