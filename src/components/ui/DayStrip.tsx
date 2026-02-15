'use client';

import { useEffect, useRef } from 'react';
import { TRIP_START_DATE, TRIP_DAYS } from '@/types/database';

interface DayStripProps {
  selectedDay: number;
  currentDay: number | null;
  onDayChange: (day: number) => void;
}

// City data with colors (using design system variables)
const CITIES = {
  Travel: { bgLight: 'bg-foreground-tertiary', bgMuted: 'bg-background-secondary dark:bg-background-tertiary', textMuted: 'text-foreground-secondary' },
  Tokyo: { bgLight: 'bg-primary', bgMuted: 'bg-primary/10 dark:bg-primary/20', textMuted: 'text-primary' },
  Hakone: { bgLight: 'bg-category-activity', bgMuted: 'bg-category-activity/10 dark:bg-category-activity/20', textMuted: 'text-category-activity' },
  Kyoto: { bgLight: 'bg-category-temple', bgMuted: 'bg-category-temple/10 dark:bg-category-temple/20', textMuted: 'text-category-temple' },
  Osaka: { bgLight: 'bg-secondary', bgMuted: 'bg-secondary/10 dark:bg-secondary/20', textMuted: 'text-secondary' },
} as const;

type CityName = keyof typeof CITIES;

// City segments with day ranges (based on accommodation nights)
const CITY_SEGMENTS: { city: CityName; startDay: number; endDay: number }[] = [
  { city: 'Travel', startDay: 0, endDay: 0 },
  { city: 'Tokyo', startDay: 1, endDay: 5 },
  { city: 'Hakone', startDay: 6, endDay: 7 },
  { city: 'Kyoto', startDay: 8, endDay: 10 },
  { city: 'Osaka', startDay: 11, endDay: 14 },
  { city: 'Travel', startDay: 15, endDay: 15 },
];

// Map day number to city (based on where you sleep that night)
const DAY_TO_CITY: Record<number, CityName> = {
  0: 'Travel',
  1: 'Tokyo', 2: 'Tokyo', 3: 'Tokyo', 4: 'Tokyo', 5: 'Tokyo',
  6: 'Hakone', 7: 'Hakone',
  8: 'Kyoto', 9: 'Kyoto', 10: 'Kyoto',
  11: 'Osaka', 12: 'Osaka', 13: 'Osaka', 14: 'Osaka',
  15: 'Travel',
};

// Day column width (w-11 = 44px) + gap (4px)
const DAY_WIDTH = 44;
const DAY_GAP = 4;

/**
 * Parse TRIP_START_DATE as local date (avoids UTC timezone issues)
 */
function getTripStartLocal(): Date {
  const [year, month, day] = TRIP_START_DATE.split('-').map(Number);
  return new Date(year!, month! - 1, day!);
}

/**
 * Get weekday abbreviation for a day number
 * Day 0 = TRIP_START_DATE
 */
function getWeekday(dayNumber: number): string {
  const date = getTripStartLocal();
  date.setDate(date.getDate() + dayNumber);
  return date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2);
}

/**
 * Get full date for a day number (for aria-label)
 * Day 0 = TRIP_START_DATE
 */
function getDate(dayNumber: number): string {
  const date = getTripStartLocal();
  date.setDate(date.getDate() + dayNumber);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Get short date for display (e.g., "3/6")
 * Day 0 = TRIP_START_DATE
 */
function getShortDate(dayNumber: number): string {
  const date = getTripStartLocal();
  date.setDate(date.getDate() + dayNumber);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function DayStrip({ selectedDay, currentDay, onDayChange }: DayStripProps) {
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

  // Days 0-15 (Day 0 is departure, Days 1-15 are in Japan)
  const days = Array.from({ length: TRIP_DAYS }, (_, i) => i);

  // Calculate total content width
  const totalWidth = TRIP_DAYS * DAY_WIDTH + (TRIP_DAYS - 1) * DAY_GAP;

  return (
    <div className="w-full">
      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className="overflow-x-auto scrollbar-hide"
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
                  key={`${segment.city}-${segment.startDay}`}
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

              const shortDate = getShortDate(day);

              return (
                <button
                  key={day}
                  ref={isSelected ? selectedRef : undefined}
                  onClick={() => onDayChange(day)}
                  role="option"
                  aria-selected={isSelected}
                  aria-label={`Day ${day}, ${getDate(day)}, ${city}${isCurrent ? ', Today' : ''}`}
                  className={`
                    flex-shrink-0 flex flex-col items-center justify-center
                    h-16 rounded-xl transition-all duration-fast relative snap-center
                    cursor-pointer active:scale-95
                    ${isSelected
                      ? `${cityData.bgLight} text-white shadow-lg`
                      : isCurrent
                        ? `${cityData.bgMuted} ring-2 ring-primary ${cityData.textMuted}`
                        : `${cityData.bgMuted} ${cityData.textMuted} hover:opacity-80`
                    }
                  `}
                  style={{ width: `${DAY_WIDTH}px` }}
                >
                  {!isSelected && (
                    <span className="text-[10px] font-semibold opacity-70">
                      {weekday}
                    </span>
                  )}
                  <span className={`font-bold ${isSelected ? 'text-xl' : 'text-lg'} leading-tight`}>{day}</span>
                  <span className={`text-[10px] ${isSelected ? 'opacity-80' : 'opacity-60'}`}>
                    {shortDate}
                  </span>
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
