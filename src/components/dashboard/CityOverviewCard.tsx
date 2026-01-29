'use client';

import { useState } from 'react';
import { useCurrentDayNumber } from '@/db/hooks';
import { getCityForDay } from '@/lib/trip-dates';
import { CityOverview } from '@/components/ai';
import { hasCityOverview } from '@/lib/tour-guide';

/**
 * City overview card for the dashboard.
 * Shows the current city with a "Learn about this city" expandable section.
 */
export function CityOverviewCard() {
  const [isExpanded, setIsExpanded] = useState(false);
  const dayNumber = useCurrentDayNumber();

  // Get current city based on day
  const currentCity = dayNumber !== null ? getCityForDay(dayNumber) : null;

  // Don't show if no city or no content available
  if (!currentCity || currentCity === 'Travel' || !hasCityOverview(currentCity)) {
    return null;
  }

  return (
    <div className="card">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden="true">
            {getCityIcon(currentCity)}
          </span>
          <div>
            <h2 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider">
              Currently in
            </h2>
            <p className="text-lg font-semibold text-foreground">{currentCity}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-primary">
          <span className="text-sm">Learn about this city</span>
          <svg
            className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-border">
          <CityOverview city={currentCity} />
        </div>
      )}
    </div>
  );
}

/**
 * Get city-specific icon
 */
function getCityIcon(city: string): string {
  switch (city.toLowerCase()) {
    case 'tokyo':
      return '🗼';
    case 'hakone':
      return '♨️';
    case 'kyoto':
      return '⛩️';
    case 'osaka':
      return '🏯';
    default:
      return '🏙️';
  }
}
