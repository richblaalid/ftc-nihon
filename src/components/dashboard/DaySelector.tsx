'use client';

import { useEffect, useRef } from 'react';
import { TRIP_START_DATE, TRIP_DAYS, DAY_CITIES } from '@/types/database';

interface DaySelectorProps {
  selectedDay: number;
  currentDay: number | null;
  onSelect: (day: number) => void;
  onClose: () => void;
}

/**
 * Format date for display
 */
function formatDate(dayNumber: number): { weekday: string; date: string } {
  const startDate = new Date(TRIP_START_DATE);
  const date = new Date(startDate);
  date.setDate(date.getDate() + dayNumber - 1);

  return {
    weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  };
}

export function DaySelector({ selectedDay, currentDay, onSelect, onClose }: DaySelectorProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Scroll selected day into view
  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, []);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Generate all 15 days
  const days = Array.from({ length: TRIP_DAYS }, (_, i) => i + 1);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="day-selector-title"
        className="max-h-[70vh] w-full max-w-lg overflow-hidden rounded-t-2xl bg-surface pb-safe"
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-background-secondary bg-surface p-4">
          <h2 id="day-selector-title" className="text-lg font-semibold text-foreground">Select Day</h2>
          <button
            onClick={onClose}
            className="min-h-touch min-w-touch rounded-full p-2 text-foreground-tertiary hover:bg-background-secondary"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Day list */}
        <div className="overflow-y-auto p-2" role="listbox" aria-label="Trip days">
          {days.map((day) => {
            const { weekday, date } = formatDate(day);
            const city = DAY_CITIES[day] ?? 'Tokyo';
            const isSelected = day === selectedDay;
            const isCurrent = day === currentDay;

            return (
              <button
                key={day}
                ref={isSelected ? selectedRef : undefined}
                onClick={() => onSelect(day)}
                role="option"
                aria-selected={isSelected}
                data-testid={`day-option-${day}`}
                className={`flex w-full items-center gap-3 rounded-lg p-3 transition-colors ${
                  isSelected
                    ? 'bg-primary/10'
                    : 'hover:bg-background-secondary'
                }`}
              >
                {/* Day number */}
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                    isSelected
                      ? 'bg-primary text-white'
                      : isCurrent
                        ? 'bg-secondary text-foreground'
                        : 'bg-background-secondary text-foreground-secondary'
                  }`}
                >
                  {day}
                </div>

                {/* Day info */}
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}
                    >
                      Day {day}
                    </span>
                    {isCurrent && (
                      <span className="rounded bg-secondary/20 px-1.5 py-0.5 text-xs font-medium text-secondary">
                        Today
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground-tertiary">
                    {weekday}, {date} · {city}
                  </p>
                </div>

                {/* Selected indicator */}
                {isSelected && <span className="text-primary">✓</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
