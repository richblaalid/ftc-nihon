'use client';

import { useState } from 'react';
import { useCurrentDayNumber } from '@/db/hooks';
import { TRIP_START_DATE, DAY_CITIES } from '@/types/database';
import { DaySelector } from './DaySelector';

/**
 * Format date for display (Day 0 = TRIP_START_DATE)
 */
function formatDate(dayNumber: number): string {
  // Parse as local date to avoid UTC timezone issues
  const [year, month, day] = TRIP_START_DATE.split('-').map(Number);
  const date = new Date(year!, month! - 1, day!);
  date.setDate(date.getDate() + dayNumber);

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

interface DayIndicatorProps {
  /** Override day number (for viewing different days) */
  selectedDay?: number;
  /** Callback when day is changed */
  onDayChange?: (day: number) => void;
}

export function DayIndicator({ selectedDay, onDayChange }: DayIndicatorProps) {
  const [showSelector, setShowSelector] = useState(false);
  const currentDayNumber = useCurrentDayNumber();

  // Use selected day if provided, otherwise current day, otherwise day 1
  const displayDay = selectedDay ?? currentDayNumber ?? 1;
  const city = DAY_CITIES[displayDay] ?? 'Tokyo';
  const isCurrentDay = displayDay === currentDayNumber;

  const handleDaySelect = (day: number) => {
    setShowSelector(false);
    onDayChange?.(day);
  };

  return (
    <>
      <button
        onClick={() => setShowSelector(true)}
        className="flex w-full items-center justify-between rounded-lg bg-background-secondary p-3 transition-colors hover:bg-background-tertiary"
      >
        <div className="flex items-center gap-3">
          {/* Day number badge */}
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
            {displayDay}
          </div>

          <div className="text-left">
            {/* Day label */}
            <p className="text-sm font-medium text-foreground">
              Day {displayDay}
              {isCurrentDay && (
                <span className="ml-2 text-xs text-primary">Today</span>
              )}
            </p>
            {/* Date and city */}
            <p className="text-xs text-foreground-tertiary">
              {formatDate(displayDay)} · {city}
            </p>
          </div>
        </div>

        {/* Chevron */}
        <span className="text-foreground-tertiary">▼</span>
      </button>

      {/* Day selector modal */}
      {showSelector && (
        <DaySelector
          selectedDay={displayDay}
          currentDay={currentDayNumber}
          onSelect={handleDaySelect}
          onClose={() => setShowSelector(false)}
        />
      )}
    </>
  );
}
