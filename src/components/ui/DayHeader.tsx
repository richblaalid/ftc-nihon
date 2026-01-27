'use client';

import type { DayInfo, DayType } from '@/types/database';

interface DayHeaderProps {
  dayInfo: DayInfo;
  className?: string;
  compact?: boolean;
}

const DAY_TYPE_CONFIG: Record<DayType, { label: string; icon: string; bgClass: string; textClass: string }> = {
  travel: {
    label: 'Travel Day',
    icon: '✈️',
    bgClass: 'bg-blue-100 dark:bg-blue-900/40',
    textClass: 'text-blue-700 dark:text-blue-300',
  },
  self_guided: {
    label: 'Self-Guided',
    icon: '🗺️',
    bgClass: 'bg-emerald-100 dark:bg-emerald-900/40',
    textClass: 'text-emerald-700 dark:text-emerald-300',
  },
  guided_tour: {
    label: 'Guided Tour',
    icon: '🧭',
    bgClass: 'bg-violet-100 dark:bg-violet-900/40',
    textClass: 'text-violet-700 dark:text-violet-300',
  },
  mixed: {
    label: 'Mixed Day',
    icon: '🎯',
    bgClass: 'bg-amber-100 dark:bg-amber-900/40',
    textClass: 'text-amber-700 dark:text-amber-300',
  },
};

/**
 * Day header component showing title, type badge, and highlights
 * Used at the top of daily schedule views
 */
export function DayHeader({ dayInfo, className = '', compact = false }: DayHeaderProps) {
  const highlights = dayInfo.highlights ? JSON.parse(dayInfo.highlights) : [];
  const typeConfig = DAY_TYPE_CONFIG[dayInfo.type];

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-foreground">Day {dayInfo.dayNumber}</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeConfig.bgClass} ${typeConfig.textClass}`}>
            {typeConfig.icon} {typeConfig.label}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl p-5
        bg-gradient-to-br from-surface to-background-secondary
        dark:from-surface dark:to-background-tertiary
        border border-foreground-tertiary/10
        shadow-sm
        ${className}
      `}
    >
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -translate-y-20 translate-x-20" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/5 rounded-full translate-y-16 -translate-x-16" />

      <div className="relative">
        {/* Day number & type badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-medium text-foreground-secondary uppercase tracking-wider">
                Day
              </span>
              <span className="text-4xl font-bold text-foreground">{dayInfo.dayNumber}</span>
            </div>
            <p className="text-sm text-foreground-tertiary mt-0.5">{formatDate(dayInfo.date)}</p>
          </div>

          {/* Type badge */}
          <span
            className={`
              shrink-0 inline-flex items-center gap-1.5
              px-3 py-1.5 rounded-full
              text-xs font-semibold
              ${typeConfig.bgClass} ${typeConfig.textClass}
            `}
          >
            <span>{typeConfig.icon}</span>
            {typeConfig.label}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-foreground mb-1 leading-tight">
          {dayInfo.title}
        </h1>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-foreground-secondary text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          <span>{dayInfo.location}</span>
        </div>

        {/* Highlights */}
        {highlights.length > 0 && (
          <div className="mt-4 pt-4 border-t border-foreground-tertiary/10">
            <p className="text-xs font-medium text-foreground-tertiary uppercase tracking-wider mb-2">
              Today&apos;s Highlights
            </p>
            <ul className="space-y-1.5">
              {highlights.map((highlight: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground-secondary">
                  <span className="text-amber-500 mt-0.5">★</span>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Optimization note if present */}
        {dayInfo.optimizationNote && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-700 dark:text-blue-400">
              <span className="font-semibold">💡 Tip:</span> {dayInfo.optimizationNote}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Minimal day header for inline use
 */
export function DayHeaderInline({ dayInfo, className = '' }: DayHeaderProps) {
  const typeConfig = DAY_TYPE_CONFIG[dayInfo.type];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl">
        <span className="text-2xl font-bold text-primary">{dayInfo.dayNumber}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground truncate">{dayInfo.title}</p>
        <div className="flex items-center gap-2 text-xs text-foreground-secondary">
          <span>{dayInfo.location}</span>
          <span className={`px-1.5 py-0.5 rounded ${typeConfig.bgClass} ${typeConfig.textClass}`}>
            {typeConfig.icon}
          </span>
        </div>
      </div>
    </div>
  );
}
