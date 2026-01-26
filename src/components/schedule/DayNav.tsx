'use client';

import { TRIP_START_DATE, TRIP_DAYS, DAY_CITIES } from '@/types/database';

interface DayNavProps {
  currentDay: number;
  onDayChange: (day: number) => void;
  isPending?: boolean;
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

export function DayNav({ currentDay, onDayChange, isPending = false }: DayNavProps) {
  const city = DAY_CITIES[currentDay] ?? 'Japan';
  const canGoPrev = currentDay > 1 && !isPending;
  const canGoNext = currentDay < TRIP_DAYS && !isPending;

  return (
    <nav
      aria-label="Day navigation"
      data-testid="day-nav"
      className={`flex items-center justify-between ${isPending ? 'opacity-70' : ''}`}
    >
      {/* Previous day button */}
      <button
        onClick={() => canGoPrev && onDayChange(currentDay - 1)}
        disabled={!canGoPrev}
        data-testid="day-nav-prev"
        className={`flex min-h-touch min-w-touch items-center justify-center rounded-full transition-colors ${
          canGoPrev
            ? 'bg-background-secondary text-foreground hover:bg-background-tertiary active:scale-95'
            : 'text-foreground-tertiary opacity-30'
        } ${isPending ? 'cursor-wait' : ''}`}
        aria-label={`Go to day ${currentDay - 1}`}
      >
        <span className="text-xl" aria-hidden="true">←</span>
      </button>

      {/* Day info */}
      <div className="text-center" aria-live="polite" aria-atomic="true">
        <div className="flex items-center justify-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white" aria-hidden="true">
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
        data-testid="day-nav-next"
        className={`flex min-h-touch min-w-touch items-center justify-center rounded-full transition-colors ${
          canGoNext
            ? 'bg-background-secondary text-foreground hover:bg-background-tertiary active:scale-95'
            : 'text-foreground-tertiary opacity-30'
        } ${isPending ? 'cursor-wait' : ''}`}
        aria-label={`Go to day ${currentDay + 1}`}
      >
        <span className="text-xl" aria-hidden="true">→</span>
      </button>
    </nav>
  );
}
