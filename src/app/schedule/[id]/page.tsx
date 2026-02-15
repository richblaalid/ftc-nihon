'use client';

import { Suspense, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActivityWithTransit } from '@/db/hooks';
import { CategoryIcon, getCategoryPillClass } from '@/components/ui/CategoryIcon';
import type { TransitStep } from '@/types/database';
import { ContextualPhrases } from '@/components/phrases/ContextualPhrases';
import { TourGuide } from '@/components/ai';
import { getLocationIdForActivity } from '@/lib/tour-guide';

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Loading skeleton for activity detail
 */
function ActivityDetailLoading() {
  return (
    <div className="flex min-h-full flex-col bg-background">
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

/**
 * Inner content component that uses the params
 */
function ActivityDetailContent({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const activity = useActivityWithTransit(id);

  // Handle back navigation - use browser history if available
  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else if (activity) {
      router.push(`/schedule?day=${activity.dayNumber}`);
    } else {
      router.push('/schedule');
    }
  };

  // Loading state
  if (activity === undefined) {
    return (
      <div className="flex min-h-full flex-col bg-background">
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
      <div className="flex min-h-full flex-col items-center justify-center bg-background p-4">
        <span className="text-4xl">🔍</span>
        <h1 className="mt-4 text-xl font-semibold text-foreground">Activity not found</h1>
        <Link href="/schedule" className="btn-primary mt-4">
          Back to Schedule
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-background-secondary bg-background/95 px-4 pb-3 pt-safe backdrop-blur-sm">
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleBack}
            className="flex min-h-touch min-w-touch items-center justify-center rounded-full text-foreground-secondary hover:bg-background-secondary"
            aria-label="Go back"
          >
            <span className="text-xl">←</span>
          </button>
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
                  href={`/map?day=${activity.dayNumber}&activity=${activity.id}`}
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
          <div className="mt-6 rounded-lg bg-category-transit/5 border border-category-transit/20 p-4">
            <h2 className="text-sm font-medium text-category-transit">🚃 Getting There</h2>

            <div className="mt-2 flex items-center justify-between">
              <span className="font-medium text-foreground">Leave by</span>
              <span className="text-xl font-bold text-category-transit">
                {formatTime(activity.transit.leaveBy)}
              </span>
            </div>

            {/* Step-by-step instructions if available */}
            {activity.transit.steps && activity.transit.steps.length > 0 ? (
              <ol className="mt-3 space-y-2">
                {activity.transit.steps.map((step, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span
                      className="shrink-0 w-5 text-center"
                      style={step.lineColor && step.type === 'train' ? { color: step.lineColor } : undefined}
                    >
                      {step.type === 'walk' ? '🚶' : step.type === 'train' ? '🚃' : '↔️'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground-secondary">{step.instruction}</p>
                      <div className="flex items-center gap-2 flex-wrap text-xs text-foreground-tertiary">
                        <span>
                          {step.duration}min
                          {step.distance && ` (${step.distance})`}
                          {step.departure && ` · Depart ${formatTime(step.departure)}`}
                        </span>
                        {step.platform && (
                          <span className="px-1.5 py-0.5 bg-category-transit/10 rounded text-category-transit">
                            {step.platform}
                          </span>
                        )}
                      </div>
                      {step.exitInfo && (
                        <p className="text-xs text-foreground-secondary mt-0.5">
                          📍 {step.exitInfo}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              /* Fallback when no steps available */
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
            )}

            {/* Family tip */}
            {activity.transit.familyTip && (
              <div className="mt-3 p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <div className="flex items-start gap-2 text-sm">
                  <span className="shrink-0">👨‍👩‍👧</span>
                  <p className="text-foreground-secondary">{activity.transit.familyTip}</p>
                </div>
              </div>
            )}

            {/* Cost and pass coverage */}
            {(activity.transit.estimatedCostYen !== undefined || activity.transit.coveredByPass) && (
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                {activity.transit.estimatedCostYen !== undefined && activity.transit.estimatedCostYen > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-background-secondary text-foreground-secondary">
                    ¥{activity.transit.estimatedCostYen.toLocaleString()}
                  </span>
                )}
                {activity.transit.coveredByPass && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-success/10 text-success">
                    ✓ {activity.transit.coveredByPass}
                  </span>
                )}
              </div>
            )}

            {/* Google Maps directions button */}
            {activity.transit.googleMapsUrl && (
              <a
                href={activity.transit.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 bg-category-transit text-white rounded-lg text-sm font-medium hover:bg-category-transit/90 active:scale-[0.98] transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                Get Directions
              </a>
            )}
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

        {/* Contextual Japanese phrases */}
        <div className="mt-6">
          <ContextualPhrases activityCategory={activity.category} />
        </div>

        {/* Tour Guide for cultural sites */}
        {(() => {
          const locationId = getLocationIdForActivity(activity.name, activity.category);
          return locationId ? (
            <div className="mt-6">
              <TourGuide locationId={locationId} variant="compact" />
            </div>
          ) : null;
        })()}

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

/**
 * Activity detail page with Suspense boundary
 */
export default function ActivityDetailPage({ params }: PageProps) {
  return (
    <Suspense fallback={<ActivityDetailLoading />}>
      <ActivityDetailContent params={params} />
    </Suspense>
  );
}
