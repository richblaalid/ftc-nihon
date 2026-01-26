'use client';

import { TRIP_START_DATE, TRIP_DAYS, DAY_CITIES } from '@/types/database';

interface DayNavProps {
  currentDay: number;
  onDayChange: (day: number) => void;
}

/**
 * Format date for display
 */
function formatDate(dayNumber: number): string {
  const startDate = new Date(TRIP_START_DATE);
  const date = new Date(startDate);
  date.setDate(date.getDate() + dayNumber - 1);

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function DayNav({ currentDay, onDayChange }: DayNavProps) {
  const city = DAY_CITIES[currentDay] ?? 'Japan';
  const canGoPrev = currentDay > 1;
  const canGoNext = currentDay < TRIP_DAYS;

  return (
    <div className="flex items-center justify-between">
      {/* Previous day button */}
      <button
        onClick={() => canGoPrev && onDayChange(currentDay - 1)}
        disabled={!canGoPrev}
        className={`flex min-h-touch min-w-touch items-center justify-center rounded-full transition-colors ${
          canGoPrev
            ? 'bg-background-secondary text-foreground hover:bg-background-tertiary active:scale-95'
            : 'text-foreground-tertiary opacity-30'
        }`}
        aria-label="Previous day"
      >
        <span className="text-xl">←</span>
      </button>

      {/* Day info */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
            {currentDay}
          </span>
          <span className="text-lg font-semibold text-foreground">Day {currentDay}</span>
        </div>
        <p className="mt-0.5 text-sm text-foreground-secondary">
          {formatDate(currentDay)} · {city}
        </p>
      </div>

      {/* Next day button */}
      <button
        onClick={() => canGoNext && onDayChange(currentDay + 1)}
        disabled={!canGoNext}
        className={`flex min-h-touch min-w-touch items-center justify-center rounded-full transition-colors ${
          canGoNext
            ? 'bg-background-secondary text-foreground hover:bg-background-tertiary active:scale-95'
            : 'text-foreground-tertiary opacity-30'
        }`}
        aria-label="Next day"
      >
        <span className="text-xl">→</span>
      </button>
    </div>
  );
}
