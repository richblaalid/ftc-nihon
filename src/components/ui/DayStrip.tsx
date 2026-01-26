'use client';

import { useEffect, useRef } from 'react';
import { TRIP_START_DATE, TRIP_DAYS } from '@/types/database';

interface DayStripProps {
  selectedDay: number;
  currentDay: number | null;
  onDayChange: (day: number) => void;
  isPending?: boolean;
}

// City data with colors
const CITIES = {
  Tokyo: { bgLight: 'bg-coral-500', bgMuted: 'bg-coral-100 dark:bg-coral-900/40', textMuted: 'text-coral-700 dark:text-coral-300' },
  Hakone: { bgLight: 'bg-emerald-500', bgMuted: 'bg-emerald-100 dark:bg-emerald-900/40', textMuted: 'text-emerald-700 dark:text-emerald-300' },
  Kyoto: { bgLight: 'bg-violet-500', bgMuted: 'bg-violet-100 dark:bg-violet-900/40', textMuted: 'text-violet-700 dark:text-violet-300' },
  Osaka: { bgLight: 'bg-amber-500', bgMuted: 'bg-amber-100 dark:bg-amber-900/40', textMuted: 'text-amber-700 dark:text-amber-300' },
} as const;

type CityName = keyof typeof CITIES;

// City segments with day ranges
const CITY_SEGMENTS: { city: CityName; startDay: number; endDay: number }[] = [
  { city: 'Tokyo', startDay: 1, endDay: 6 },
  { city: 'Hakone', startDay: 7, endDay: 8 },
  { city: 'Kyoto', startDay: 9, endDay: 11 },
  { city: 'Osaka', startDay: 12, endDay: 15 },
];

// Map day number to city
const DAY_TO_CITY: Record<number, CityName> = {
  1: 'Tokyo', 2: 'Tokyo', 3: 'Tokyo', 4: 'Tokyo', 5: 'Tokyo', 6: 'Tokyo',
  7: 'Hakone', 8: 'Hakone',
  9: 'Kyoto', 10: 'Kyoto', 11: 'Kyoto',
  12: 'Osaka', 13: 'Osaka', 14: 'Osaka', 15: 'Osaka',
};

// Day column width (w-11 = 44px) + gap (4px)
const DAY_WIDTH = 44;
const DAY_GAP = 4;

/**
 * Get weekday abbreviation for a day number
 */
function getWeekday(dayNumber: number): string {
  const startDate = new Date(TRIP_START_DATE);
  const date = new Date(startDate);
  date.setDate(date.getDate() + dayNumber - 1);
  return date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2);
}

/**
 * Get full date for a day number
 */
function getDate(dayNumber: number): string {
  const startDate = new Date(TRIP_START_DATE);
  const date = new Date(startDate);
  date.setDate(date.getDate() + dayNumber - 1);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function DayStrip({ selectedDay, currentDay, onDayChange, isPending = false }: DayStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  // Scroll selected day into view on mount and when selection changes
  useEffect(() => {
    if (selectedRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const element = selectedRef.current;
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      // Center the selected element
      const scrollLeft = element.offsetLeft - (containerRect.width / 2) + (elementRect.width / 2);
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [selectedDay]);

  const days = Array.from({ length: TRIP_DAYS }, (_, i) => i + 1);

  // Calculate total content width
  const totalWidth = TRIP_DAYS * DAY_WIDTH + (TRIP_DAYS - 1) * DAY_GAP;

  return (
    <div className="w-full">
      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className={`overflow-x-auto scrollbar-hide ${
          isPending ? 'opacity-70 pointer-events-none' : ''
        }`}
        role="listbox"
        aria-label="Trip days"
      >
        <div className="px-4 py-2" style={{ width: `${totalWidth + 32}px` }}>
          {/* City bars row */}
          <div className="flex mb-2" style={{ gap: `${DAY_GAP}px` }}>
            {CITY_SEGMENTS.map((segment) => {
              const dayCount = segment.endDay - segment.startDay + 1;
              const barWidth = dayCount * DAY_WIDTH + (dayCount - 1) * DAY_GAP;
              const cityData = CITIES[segment.city];

              return (
                <div
                  key={segment.city}
                  className={`${cityData.bgLight} rounded-full flex items-center justify-center h-7`}
                  style={{ width: `${barWidth}px` }}
                >
                  <span className="text-xs font-bold text-white tracking-wide">
                    {segment.city}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Day buttons row */}
          <div className="flex" style={{ gap: `${DAY_GAP}px` }}>
            {days.map((day) => {
              const isSelected = day === selectedDay;
              const isCurrent = day === currentDay;
              const weekday = getWeekday(day);
              const city = DAY_TO_CITY[day] ?? 'Tokyo';
              const cityData = CITIES[city];

              return (
                <button
                  key={day}
                  ref={isSelected ? selectedRef : undefined}
                  onClick={() => !isPending && onDayChange(day)}
                  disabled={isPending}
                  role="option"
                  aria-selected={isSelected}
                  aria-label={`Day ${day}, ${getDate(day)}, ${city}${isCurrent ? ', Today' : ''}`}
                  className={`
                    flex-shrink-0 flex flex-col items-center justify-center
                    h-14 rounded-xl transition-all duration-fast relative snap-center
                    ${isSelected
                      ? `${cityData.bgLight} text-white shadow-lg`
                      : isCurrent
                        ? `${cityData.bgMuted} ring-2 ring-primary ${cityData.textMuted}`
                        : `${cityData.bgMuted} ${cityData.textMuted} hover:opacity-80`
                    }
                    ${isPending ? 'cursor-wait' : 'cursor-pointer active:scale-95'}
                  `}
                  style={{ width: `${DAY_WIDTH}px` }}
                >
                  {!isSelected && (
                    <span className="text-[10px] font-semibold opacity-70">
                      {weekday}
                    </span>
                  )}
                  <span className={`font-bold ${isSelected ? 'text-xl' : 'text-lg'}`}>{day}</span>
                  {isCurrent && !isSelected && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mt-1 mx-4 h-1 rounded-full bg-background-secondary overflow-hidden">
        <div
          className="h-full bg-primary/60 transition-all duration-normal"
          style={{ width: `${(selectedDay / TRIP_DAYS) * 100}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
