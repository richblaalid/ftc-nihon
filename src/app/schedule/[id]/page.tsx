'use client';

import { use } from 'react';
import Link from 'next/link';
import { useActivityWithTransit } from '@/db/hooks';
import { CategoryIcon, getCategoryPillClass } from '@/components/ui/CategoryIcon';

interface PageProps {
  params: Promise<{ id: string }>;
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
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
}

export default function ActivityDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const activity = useActivityWithTransit(id);

  // Loading state
  if (activity === undefined) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <header className="sticky top-0 z-10 border-b border-background-secondary bg-background px-4 pb-3 pt-safe">
          <div className="flex items-center gap-3 pt-2">
            <Link
              href="/schedule"
              className="flex min-h-touch min-w-touch items-center justify-center rounded-full text-foreground-secondary hover:bg-background-secondary"
            >
              <span className="text-xl">←</span>
            </Link>
            <div className="h-6 w-32 animate-pulse rounded bg-background-secondary" />
          </div>
        </header>
        <main className="flex-1 p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 rounded bg-background-secondary" />
            <div className="h-4 w-32 rounded bg-background-secondary" />
            <div className="h-20 rounded bg-background-secondary" />
          </div>
        </main>
      </div>
    );
  }

  // Not found
  if (!activity) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <span className="text-4xl">🔍</span>
        <h1 className="mt-4 text-xl font-semibold text-foreground">Activity not found</h1>
        <Link href="/schedule" className="btn-primary mt-4">
          Back to Schedule
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-background-secondary bg-background/95 px-4 pb-3 pt-safe backdrop-blur-sm">
        <div className="flex items-center gap-3 pt-2">
          <Link
            href={`/schedule?day=${activity.dayNumber}`}
            className="flex min-h-touch min-w-touch items-center justify-center rounded-full text-foreground-secondary hover:bg-background-secondary"
          >
            <span className="text-xl">←</span>
          </Link>
          <span className={getCategoryPillClass(activity.category)}>
            <CategoryIcon category={activity.category} size="sm" />
            <span className="ml-1 capitalize">{activity.category}</span>
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-4 pb-safe">
        {/* Title */}
        <h1 className="text-2xl font-bold text-foreground">{activity.name}</h1>

        {/* Time info */}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-foreground-secondary">
          <span>{formatTime(activity.startTime)}</span>
          {activity.durationMinutes && (
            <>
              <span>·</span>
              <span>{formatDuration(activity.durationMinutes)}</span>
            </>
          )}
          {activity.isHardDeadline && (
            <span className="rounded bg-error/10 px-2 py-0.5 text-xs font-medium text-error">
              Timed entry
            </span>
          )}
        </div>

        {/* Location with map link */}
        {activity.locationName && (
          <div className="mt-4">
            <h2 className="text-sm font-medium text-foreground-tertiary">Location</h2>
            <p className="mt-1 text-foreground">{activity.locationName}</p>
            {activity.locationAddress && (
              <p className="mt-0.5 text-sm text-foreground-secondary">{activity.locationAddress}</p>
            )}
            {activity.locationAddressJp && (
              <p className="mt-0.5 text-sm text-foreground-tertiary">{activity.locationAddressJp}</p>
            )}

            {/* Map and directions buttons */}
            <div className="mt-3 flex flex-wrap gap-2">
              {activity.googleMapsUrl && (
                <a
                  href={activity.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary inline-flex items-center gap-2 text-sm"
                >
                  <span>🗺️</span>
                  <span>Open in Maps</span>
                </a>
              )}
              {(activity.locationLat && activity.locationLng) && (
                <Link
                  href={`/map?lat=${activity.locationLat}&lng=${activity.locationLng}&name=${encodeURIComponent(activity.name)}`}
                  className="btn-secondary inline-flex items-center gap-2 text-sm"
                >
                  <span>📍</span>
                  <span>View on Map</span>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Transit info */}
        {activity.transit && (
          <div className="mt-6 rounded-lg bg-background-secondary p-4">
            <h2 className="text-sm font-medium text-foreground-tertiary">Getting There</h2>

            <div className="mt-2 flex items-center justify-between">
              <span className="font-medium text-foreground">Leave by</span>
              <span className="text-xl font-bold text-primary">
                {formatTime(activity.transit.leaveBy)}
              </span>
            </div>

            <div className="mt-3 space-y-2 text-sm text-foreground-secondary">
              {activity.transit.walkToStationMinutes && (
                <p>🚶 Walk to station: {activity.transit.walkToStationMinutes} min</p>
              )}
              {activity.transit.stationName && (
                <p>🚉 From: {activity.transit.stationName}</p>
              )}
              {activity.transit.trainLine && (
                <p>🚃 Take: {activity.transit.trainLine}</p>
              )}
              {activity.transit.arrivalStation && (
                <p>🚉 To: {activity.transit.arrivalStation}</p>
              )}
              {activity.transit.travelMinutes && (
                <p>⏱️ Travel time: {activity.transit.travelMinutes} min</p>
              )}
              {activity.transit.walkToDestinationMinutes && (
                <p>🚶 Walk to destination: {activity.transit.walkToDestinationMinutes} min</p>
              )}
              {activity.transit.transfers && (
                <p>🔄 Transfers: {activity.transit.transfers}</p>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        {activity.description && (
          <div className="mt-6">
            <h2 className="text-sm font-medium text-foreground-tertiary">About</h2>
            <p className="mt-1 whitespace-pre-line text-foreground">{activity.description}</p>
          </div>
        )}

        {/* Tips */}
        {activity.tips && (
          <div className="mt-6">
            <h2 className="text-sm font-medium text-foreground-tertiary">💡 Tips</h2>
            <p className="mt-1 whitespace-pre-line text-foreground">{activity.tips}</p>
          </div>
        )}

        {/* What to order */}
        {activity.whatToOrder && (
          <div className="mt-6">
            <h2 className="text-sm font-medium text-foreground-tertiary">🍽️ What to Order</h2>
            <p className="mt-1 whitespace-pre-line text-foreground">{activity.whatToOrder}</p>
          </div>
        )}

        {/* Backup alternative */}
        {activity.backupAlternative && (
          <div className="mt-6">
            <h2 className="text-sm font-medium text-foreground-tertiary">🔄 Backup Option</h2>
            <p className="mt-1 whitespace-pre-line text-foreground">{activity.backupAlternative}</p>
          </div>
        )}

        {/* Website link */}
        {activity.websiteUrl && (
          <div className="mt-6">
            <a
              href={activity.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary inline-flex items-center gap-2"
            >
              <span>🌐</span>
              <span>Visit Website</span>
            </a>
          </div>
        )}

        {/* Kid friendly indicator */}
        {activity.isKidFriendly && (
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-sm text-success">
            <span>👶</span>
            <span>Kid Friendly</span>
          </div>
        )}
      </main>
    </div>
  );
}
