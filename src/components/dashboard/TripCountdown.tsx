'use client';

import { useEffect, useState } from 'react';
import { TRIP_START_DATE } from '@/types/database';

/**
 * Calculate days until trip starts
 */
function getDaysUntilTrip(): number {
  const now = new Date();
  const tripStart = new Date(TRIP_START_DATE);

  // Reset to start of day for accurate day calculation
  now.setHours(0, 0, 0, 0);
  tripStart.setHours(0, 0, 0, 0);

  const diffTime = tripStart.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}

/**
 * Format the trip start date for display
 */
function formatTripDate(): string {
  const tripStart = new Date(TRIP_START_DATE);
  return tripStart.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Countdown card showing days until trip starts
 */
export function TripCountdown() {
  // Calculate initial value during render (safe for SSR since it's the same result)
  const [daysUntil, setDaysUntil] = useState(() => getDaysUntilTrip());

  useEffect(() => {
    // Update at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    const timeout = setTimeout(() => {
      setDaysUntil(getDaysUntilTrip());
      // Then update every 24 hours
      const interval = setInterval(() => {
        setDaysUntil(getDaysUntilTrip());
      }, 24 * 60 * 60 * 1000);

      return () => clearInterval(interval);
    }, msUntilMidnight);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="card text-center py-6">
      <p className="text-sm font-medium text-foreground-secondary uppercase tracking-wider">
        Days Until Japan
      </p>
      <p className="text-6xl font-display font-bold text-primary mt-2">
        {daysUntil}
      </p>
      <p className="text-sm text-foreground-tertiary mt-2">
        {formatTripDate()}
      </p>
    </div>
  );
}
