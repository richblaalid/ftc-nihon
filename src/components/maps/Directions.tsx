'use client';

import { useState } from 'react';
import type { ActivityWithTransit, TransitStep } from '@/types/database';
import { getCategoryBgClass } from '@/components/ui/CategoryIcon';

interface DirectionsProps {
  activity: ActivityWithTransit;
  userLocation?: { lat: number; lng: number } | null;
  onClose?: () => void;
}

/**
 * Format time from HH:MM to 12-hour format with AM/PM
 */
function formatTime(time: string): string {
  const parts = time.split(':');
  const hoursStr = parts[0];
  const minutesStr = parts[1];
  if (!hoursStr || !minutesStr) return time;
  const h = parseInt(hoursStr, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutesStr} ${ampm}`;
}

/**
 * Step-by-step directions component
 * Shows transit steps with walking and train segments
 */
export function Directions({ activity, userLocation, onClose }: DirectionsProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Parse transit steps from JSON if available
  const transitSteps: TransitStep[] = activity.transitSteps || [];

  // Build Google Maps directions URL
  const getGoogleMapsUrl = () => {
    if (!activity.locationLat || !activity.locationLng) return null;

    const destination = `${activity.locationLat},${activity.locationLng}`;
    const origin = userLocation ? `${userLocation.lat},${userLocation.lng}` : '';

    // Use transit mode for Japan
    const params = new URLSearchParams({
      api: '1',
      destination,
      travelmode: 'transit',
    });

    if (origin) {
      params.set('origin', origin);
    }

    return `https://www.google.com/maps/dir/?${params.toString()}`;
  };

  const googleMapsUrl = getGoogleMapsUrl();

  // Get step icon
  const getStepIcon = (type: string) => {
    switch (type) {
      case 'walk':
        return '🚶';
      case 'train':
      case 'subway':
        return '🚃';
      case 'bus':
        return '🚌';
      case 'transfer':
        return '🔄';
      default:
        return '➡️';
    }
  };

  return (
    <div className="bg-background rounded-xl shadow-lg border border-border overflow-hidden">
      {/* Header */}
      <div className={`${getCategoryBgClass(activity.category)} px-4 py-3`}>
        <div className="flex items-center justify-between">
          <div className="text-white">
            <p className="text-sm opacity-90">Directions to</p>
            <h3 className="font-semibold">{activity.name}</h3>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-4">
          {activity.leaveBy && (
            <div className="flex items-center gap-2">
              <span className="text-2xl">🚃</span>
              <div>
                <p className="text-xs text-foreground-tertiary">Leave by</p>
                <p className="font-semibold text-category-transit">{formatTime(activity.leaveBy)}</p>
              </div>
            </div>
          )}
          {activity.travelMinutes && (
            <div className="flex items-center gap-2">
              <span className="text-2xl">⏱️</span>
              <div>
                <p className="text-xs text-foreground-tertiary">Travel time</p>
                <p className="font-semibold">{activity.travelMinutes} min</p>
              </div>
            </div>
          )}
          {activity.stationName && (
            <div className="flex items-center gap-2">
              <span className="text-2xl">🚉</span>
              <div>
                <p className="text-xs text-foreground-tertiary">From</p>
                <p className="font-semibold text-sm">{activity.stationName}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Steps */}
      {transitSteps.length > 0 && (
        <div className="p-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-between w-full mb-3"
          >
            <span className="text-sm font-medium text-foreground-secondary">
              Step-by-step directions
            </span>
            <svg
              className={`w-5 h-5 text-foreground-tertiary transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isExpanded && (
            <div className="space-y-3">
              {transitSteps.map((step, index) => (
                <div key={index} className="flex gap-3">
                  {/* Step icon */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-background-secondary flex items-center justify-center">
                    <span className="text-sm">{getStepIcon(step.type)}</span>
                  </div>

                  {/* Step details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{step.instruction}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {step.duration && (
                        <span className="text-xs text-foreground-tertiary">{step.duration} min</span>
                      )}
                      {step.departure && (
                        <span className="text-xs text-category-transit font-medium">
                          {formatTime(step.departure)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* No pre-calculated directions message */}
      {transitSteps.length === 0 && (
        <div className="p-4 text-center">
          <p className="text-sm text-foreground-secondary">
            No pre-calculated directions available.
          </p>
          <p className="text-xs text-foreground-tertiary mt-1">
            Use Google Maps for live directions.
          </p>
        </div>
      )}

      {/* Open in Google Maps button */}
      {googleMapsUrl && (
        <div className="p-4 border-t border-border">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary w-full flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            Open in Google Maps
          </a>
        </div>
      )}
    </div>
  );
}

/**
 * Compact directions card for embedding
 */
export function DirectionsCard({ activity, userLocation }: { activity: ActivityWithTransit; userLocation?: { lat: number; lng: number } | null }) {
  // Build Google Maps directions URL
  const getGoogleMapsUrl = () => {
    if (!activity.locationLat || !activity.locationLng) return null;

    const destination = `${activity.locationLat},${activity.locationLng}`;
    const origin = userLocation ? `${userLocation.lat},${userLocation.lng}` : '';

    const params = new URLSearchParams({
      api: '1',
      destination,
      travelmode: 'transit',
    });

    if (origin) {
      params.set('origin', origin);
    }

    return `https://www.google.com/maps/dir/?${params.toString()}`;
  };

  const googleMapsUrl = getGoogleMapsUrl();

  if (!activity.leaveBy && !googleMapsUrl) return null;

  return (
    <div className="bg-background-secondary rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {activity.leaveBy && (
            <div className="flex items-center gap-1.5">
              <span>🚃</span>
              <span className="text-sm font-medium text-category-transit">
                Leave by {formatTime(activity.leaveBy)}
              </span>
            </div>
          )}
          {activity.travelMinutes && (
            <span className="text-sm text-foreground-secondary">
              ({activity.travelMinutes} min)
            </span>
          )}
        </div>

        {googleMapsUrl && (
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary-hover text-sm font-medium flex items-center gap-1"
          >
            Maps
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}
