'use client';

import { useState, useEffect } from 'react';
import type { TransitSegment, TransitStep } from '@/types/database';
import { getCurrentDate } from '@/lib/utils';

interface TransitCardProps {
  transit: TransitSegment;
  isViewingToday: boolean;
  isCompleted?: boolean;
}

/**
 * Get current time in Japan timezone as HH:MM
 */
function getJapanTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    timeZone: 'Asia/Tokyo',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Parse time string to minutes since midnight
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
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
 * Calculate minutes until departure
 */
function getMinutesUntilDeparture(leaveBy: string): number {
  const now = getCurrentDate();
  const currentTime = getJapanTime(now);
  const currentMins = timeToMinutes(currentTime);
  const leaveMins = timeToMinutes(leaveBy);
  return leaveMins - currentMins;
}

/**
 * Get total journey duration including walks
 */
function getTotalDuration(transit: TransitSegment): number {
  let total = 0;
  if (transit.walkToStationMinutes) total += transit.walkToStationMinutes;
  if (transit.travelMinutes) total += transit.travelMinutes;
  if (transit.walkToDestinationMinutes) total += transit.walkToDestinationMinutes;
  return total;
}

/**
 * Get step icon based on type
 */
function getStepIcon(type: TransitStep['type']): string {
  switch (type) {
    case 'walk':
      return '🚶';
    case 'train':
      return '🚃';
    case 'transfer':
      return '↔️';
    default:
      return '•';
  }
}

export function TransitCard({ transit, isViewingToday, isCompleted = false }: TransitCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [minutesUntil, setMinutesUntil] = useState<number>(() =>
    getMinutesUntilDeparture(transit.leaveBy)
  );

  // Update countdown every minute when viewing today
  useEffect(() => {
    if (!isViewingToday || isCompleted) return;

    const updateCountdown = () => {
      setMinutesUntil(getMinutesUntilDeparture(transit.leaveBy));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [transit.leaveBy, isViewingToday, isCompleted]);

  const totalDuration = getTotalDuration(transit);
  const isUrgent = isViewingToday && !isCompleted && minutesUntil > 0 && minutesUntil <= 15;
  const showCountdown = isViewingToday && !isCompleted && minutesUntil > 0 && minutesUntil <= 60;

  // Determine card styling based on state
  const cardClasses = [
    'border-l-4 rounded-lg transition-all',
    isCompleted ? 'opacity-50 bg-background-secondary/50' : 'bg-category-transit/5',
    isUrgent ? 'border-error bg-error/5' : 'border-category-transit',
  ].join(' ');

  return (
    <div className={cardClasses}>
      {/* Collapsed view - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-expanded={isExpanded}
        aria-label={`Transit from ${transit.stationName} to ${transit.arrivalStation}. ${isExpanded ? 'Collapse' : 'Expand'} for details.`}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Left side: Transit info */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-category-transit text-sm shrink-0">🚃</span>
            <div className="min-w-0">
              {/* Main route summary */}
              <div className="flex items-center gap-1 text-sm">
                <span className="font-medium text-foreground truncate">
                  {transit.stationName?.split(' ')[0]}
                </span>
                <span className="text-foreground-tertiary">→</span>
                <span className="font-medium text-foreground truncate">
                  {transit.arrivalStation?.split(' ')[0]}
                </span>
                <span className="text-foreground-tertiary text-xs ml-1">
                  ({totalDuration}min)
                </span>
              </div>
              {/* Train line */}
              <p className="text-xs text-foreground-secondary truncate">
                {transit.trainLine?.split(' ')[0]}
                {transit.transfers && ` • ${transit.transfers.split(' ')[0]}`}
              </p>
            </div>
          </div>

          {/* Right side: Leave by time / countdown */}
          <div className="flex items-center gap-2 shrink-0">
            {showCountdown ? (
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                isUrgent
                  ? 'bg-error/10 text-error'
                  : 'bg-category-transit/10 text-category-transit'
              }`}>
                Leave in {minutesUntil}min
              </div>
            ) : (
              <div className="text-right">
                <p className="text-xs text-foreground-tertiary">Leave by</p>
                <p className="text-sm font-semibold text-category-transit">
                  {formatTime(transit.leaveBy)}
                </p>
              </div>
            )}
            {/* Expand indicator */}
            <svg
              className={`w-4 h-4 text-foreground-tertiary transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {/* Expanded view */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-1 border-t border-border/50">
          {/* Step-by-step instructions */}
          {transit.steps && transit.steps.length > 0 ? (
            <ol className="space-y-2">
              {transit.steps.map((step, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span
                    className="shrink-0 w-5 text-center"
                    style={step.lineColor && step.type === 'train' ? { color: step.lineColor } : undefined}
                  >
                    {getStepIcon(step.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-foreground-secondary">{step.instruction}</p>
                      {step.lineColor && step.type === 'train' && (
                        <span
                          className="inline-block w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: step.lineColor }}
                          title="Train line color"
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap text-xs text-foreground-tertiary">
                      <span>
                        {step.duration}min
                        {step.distance && ` (${step.distance})`}
                        {step.departure && ` • Depart ${formatTime(step.departure)}`}
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
            <div className="space-y-2 text-sm">
              {transit.walkToStationMinutes && (
                <div className="flex items-center gap-2">
                  <span>🚶</span>
                  <span className="text-foreground-secondary">
                    Walk to {transit.stationName} ({transit.walkToStationMinutes}min)
                  </span>
                </div>
              )}
              {transit.travelMinutes && (
                <div className="flex items-center gap-2">
                  <span>🚃</span>
                  <span className="text-foreground-secondary">
                    {transit.trainLine} ({transit.travelMinutes}min)
                  </span>
                </div>
              )}
              {transit.transfers && (
                <div className="flex items-center gap-2">
                  <span>↔️</span>
                  <span className="text-foreground-secondary">{transit.transfers}</span>
                </div>
              )}
              {transit.walkToDestinationMinutes && (
                <div className="flex items-center gap-2">
                  <span>🚶</span>
                  <span className="text-foreground-secondary">
                    Walk to destination ({transit.walkToDestinationMinutes}min)
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Family tip */}
          {transit.familyTip && (
            <div className="mt-3 p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <div className="flex items-start gap-2 text-sm">
                <span className="shrink-0">👨‍👩‍👧</span>
                <p className="text-foreground-secondary">{transit.familyTip}</p>
              </div>
            </div>
          )}

          {/* Cost and pass coverage */}
          {(transit.estimatedCostYen !== undefined || transit.coveredByPass) && (
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              {transit.estimatedCostYen !== undefined && transit.estimatedCostYen > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-background-secondary text-foreground-secondary">
                  ¥{transit.estimatedCostYen.toLocaleString()}
                </span>
              )}
              {transit.coveredByPass && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-success/10 text-success">
                  ✓ {transit.coveredByPass}
                </span>
              )}
            </div>
          )}

          {/* Summary row */}
          <div className="mt-3 pt-2 border-t border-border/30 flex items-center justify-between text-xs text-foreground-tertiary">
            <span>
              Arrive at {transit.arrivalStation?.split(' ')[0]}
            </span>
            <span>
              Total: {totalDuration}min
              {transit.bufferMinutes > 0 && ` (+${transit.bufferMinutes}min buffer)`}
            </span>
          </div>

          {/* Google Maps button */}
          {transit.googleMapsUrl && (
            <a
              href={transit.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 bg-category-transit text-white rounded-lg text-sm font-medium hover:bg-category-transit/90 active:scale-[0.98] transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              Open in Google Maps
            </a>
          )}
        </div>
      )}
    </div>
  );
}
