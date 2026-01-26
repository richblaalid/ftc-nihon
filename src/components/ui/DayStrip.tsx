'use client';

import { useEffect, useRef } from 'react';
import { TRIP_START_DATE, TRIP_DAYS } from '@/types/database';

interface DayStripProps {
  selectedDay: number;
  currentDay: number | null;
  onDayChange: (day: number) => void;
  isPending?: boolean;
}

// City groupings for visual sections
const CITY_SECTIONS = [
  { city: 'Tokyo', days: [1, 2, 3, 4, 5, 6], color: 'coral' },
  { city: 'Hakone', days: [7, 8], color: 'emerald' },
  { city: 'Kyoto', days: [9, 10, 11], color: 'violet' },
  { city: 'Osaka', days: [12, 13, 14, 15], color: 'amber' },
] as const;

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

  // Scroll selected day into view on mount
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

  return (
    <div className="relative">
      {/* Fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-6 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-6 bg-gradient-to-l from-background to-transparent" />

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className={`flex gap-1 overflow-x-auto scrollbar-hide px-4 py-2 snap-x snap-mandatory ${
          isPending ? 'opacity-70 pointer-events-none' : ''
        }`}
        role="listbox"
        aria-label="Trip days"
      >
        {CITY_SECTIONS.map((section, sectionIndex) => (
          <div key={section.city} className="flex items-center gap-1">
            {/* City label pill - using darker text for WCAG AA contrast */}
            <div
              className={`sticky left-0 z-20 flex-shrink-0 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                section.color === 'coral' ? 'bg-coral-100 text-coral-800 dark:bg-coral-900/30 dark:text-coral-300' :
                section.color === 'emerald' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' :
                section.color === 'violet' ? 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300' :
                'bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-300'
              }`}
            >
              {section.city}
            </div>

            {/* Days in this section */}
            {section.days.map((day) => {
              const isSelected = day === selectedDay;
              const isCurrent = day === currentDay;
              const weekday = getWeekday(day);

              return (
                <button
                  key={day}
                  ref={isSelected ? selectedRef : undefined}
                  onClick={() => !isPending && onDayChange(day)}
                  disabled={isPending}
                  role="option"
                  aria-selected={isSelected}
                  aria-label={`Day ${day}, ${getDate(day)}${isCurrent ? ', Today' : ''}`}
                  className={`
                    snap-center flex-shrink-0 flex flex-col items-center justify-center
                    w-11 h-14 rounded-xl transition-all duration-fast
                    ${isSelected
                      ? 'bg-primary text-white scale-105 shadow-md'
                      : isCurrent
                        ? 'bg-background-secondary ring-2 ring-primary text-foreground'
                        : 'bg-background-secondary text-foreground-secondary hover:bg-background-tertiary'
                    }
                    ${isPending ? 'cursor-wait' : 'cursor-pointer active:scale-95'}
                  `}
                >
                  {!isSelected && (
                    <span className="text-[10px] font-semibold text-foreground-secondary">
                      {weekday}
                    </span>
                  )}
                  <span className={`font-bold ${isSelected ? 'text-xl' : 'text-lg'}`}>{day}</span>
                  {isCurrent && !isSelected && (
                    <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-primary animate-pulse" />
                  )}
                </button>
              );
            })}

            {/* Divider between cities (except last) */}
            {sectionIndex < CITY_SECTIONS.length - 1 && (
              <div className="flex-shrink-0 w-px h-8 bg-border mx-1" aria-hidden="true" />
            )}
          </div>
        ))}
      </div>

      {/* Progress indicator */}
      <div className="mt-1 mx-4 h-1 rounded-full bg-background-secondary overflow-hidden">
        <div
          className="h-full bg-primary/60 transition-all duration-normal"
          style={{ width: `${((selectedDay) / TRIP_DAYS) * 100}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
