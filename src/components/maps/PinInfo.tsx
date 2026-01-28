'use client';

import type { ActivityWithTransit } from '@/types/database';
import { getCategoryBgClass } from '@/components/ui/CategoryIcon';
import Link from 'next/link';

interface PinInfoProps {
  activity: ActivityWithTransit;
  onClose?: () => void;
  onNavigate?: () => void;
}

/**
 * Info popup shown when tapping a map pin
 * Displays activity summary with quick actions
 */
export function PinInfo({ activity, onClose, onNavigate }: PinInfoProps) {
  const categoryBg = getCategoryBgClass(activity.category);

  // Format time display
  const formatTime = (time: string) => {
    const parts = time.split(':');
    const hoursStr = parts[0];
    const minutesStr = parts[1];
    if (!hoursStr || !minutesStr) return time;
    const h = parseInt(hoursStr, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutesStr} ${ampm}`;
  };

  return (
    <div className="bg-background rounded-xl shadow-lg border border-border overflow-hidden min-w-[280px] max-w-[320px]">
      {/* Category accent bar */}
      <div className={`h-1 ${categoryBg}`} />

      {/* Content */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{activity.name}</h3>
            <p className="text-sm text-foreground-secondary">{formatTime(activity.startTime)}</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 min-h-touch min-w-touch flex items-center justify-center rounded-full hover:bg-background-secondary transition-colors"
              aria-label="Close activity info"
              data-testid="pin-info-close"
            >
              <svg className="w-5 h-5 text-foreground-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Location */}
        {activity.locationName && (
          <p className="mt-2 text-sm text-foreground-secondary truncate">
            📍 {activity.locationName}
          </p>
        )}

        {/* Leave by time if available */}
        {activity.leaveBy && (
          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-category-transit/10 rounded-full">
            <span className="text-xs">🚃</span>
            <span className="text-xs font-medium text-category-transit">
              Leave by {formatTime(activity.leaveBy)}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <Link
            href={
              activity.category === 'hotel'
                ? `/reservations?hotel=${activity.id.replace('hotel-', '')}`
                : `/schedule/${activity.id}`
            }
            className="flex-1 btn btn-secondary text-sm py-2"
          >
            View Details
          </Link>
          <button
            onClick={onNavigate}
            className="flex-1 btn btn-primary text-sm py-2"
          >
            Directions
          </button>
        </div>
      </div>
    </div>
  );
}
