'use client';

import { useEffect, useState } from 'react';
import {
  getDaysUntilTrip as calcDaysUntilTrip,
  formatTripDate as formatTripDay,
} from '@/lib/trip-dates';

/**
 * Countdown card showing days until trip starts
 */
export function TripCountdown() {
  // Start with null to avoid hydration mismatch, then calculate on client
  const [daysUntil, setDaysUntil] = useState<number | null>(null);

  useEffect(() => {
    // Set initial value on mount (client-side only)
    setDaysUntil(calcDaysUntilTrip());

    // Update at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    const timeout = setTimeout(() => {
      setDaysUntil(calcDaysUntilTrip());
      // Then update every 24 hours
      const interval = setInterval(() => {
        setDaysUntil(calcDaysUntilTrip());
      }, 24 * 60 * 60 * 1000);

      return () => clearInterval(interval);
    }, msUntilMidnight);

    return () => clearTimeout(timeout);
  }, []);

  // Show skeleton while calculating on client
  if (daysUntil === null) {
    return (
      <div className="card text-center py-6 animate-pulse">
        <div className="h-4 w-32 mx-auto rounded bg-background-secondary" />
        <div className="h-16 w-20 mx-auto mt-2 rounded bg-background-secondary" />
        <div className="h-4 w-48 mx-auto mt-2 rounded bg-background-secondary" />
      </div>
    );
  }

  return (
    <div className="card text-center py-6">
      <p className="text-sm font-medium text-foreground-secondary uppercase tracking-wider">
        Days Until Japan
      </p>
      <p className="text-6xl font-display font-bold text-primary mt-2">
        {daysUntil}
      </p>
      <p className="text-sm text-foreground-tertiary mt-2">
        {formatTripDay(0, 'long')}
      </p>
    </div>
  );
}
