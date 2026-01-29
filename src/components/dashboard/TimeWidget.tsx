'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface TimeZoneDisplay {
  label: string;
  timeZone: string;
  flag: string;
}

const TIME_ZONES: TimeZoneDisplay[] = [
  { label: 'Japan', timeZone: 'Asia/Tokyo', flag: '🇯🇵' },
  { label: 'Minneapolis', timeZone: 'America/Chicago', flag: '🇺🇸' },
];

function formatTime(date: Date, timeZone: string): string {
  return date.toLocaleTimeString('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDate(date: Date, timeZone: string): string {
  return date.toLocaleDateString('en-US', {
    timeZone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function TimeWidget() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional for hydration fix
    setNow(new Date());

    // Update every minute
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Show loading state during SSR/hydration
  if (!now) {
    return (
      <div className="card">
        <div className="flex justify-between gap-4">
          {TIME_ZONES.map((tz) => (
            <div key={tz.timeZone} className="flex-1 text-center">
              <div className="h-4 w-16 mx-auto rounded bg-background-secondary animate-pulse" />
              <div className="h-7 w-20 mx-auto mt-1 rounded bg-background-secondary animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex justify-between gap-4">
        {TIME_ZONES.map((tz) => (
          <div key={tz.timeZone} className="flex-1 text-center">
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-sm" aria-hidden="true">{tz.flag}</span>
              <span className="text-sm font-medium text-foreground-secondary">{tz.label}</span>
            </div>
            <p className="text-xl font-semibold text-foreground">
              {formatTime(now, tz.timeZone)}
            </p>
            <p className="text-xs text-foreground-tertiary">
              {formatDate(now, tz.timeZone)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Compact time widget for 2-column layout
 * Shows Japan time prominently with US time smaller below
 */
export function TimeWidgetCompact() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional for hydration fix
    setNow(new Date());

    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  if (!now) {
    return (
      <div className="card p-3">
        <div className="h-4 w-12 rounded bg-background-secondary animate-pulse" />
        <div className="h-6 w-16 mt-1 rounded bg-background-secondary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="card p-3">
      {/* Japan time - prominent */}
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-sm" aria-hidden="true">🇯🇵</span>
        <span className="text-lg font-semibold text-foreground">
          {formatTime(now, 'Asia/Tokyo')}
        </span>
      </div>
      {/* US time - smaller */}
      <div className="flex items-center gap-1.5 text-xs text-foreground-tertiary">
        <span aria-hidden="true">🇺🇸</span>
        <span>{formatTime(now, 'America/Chicago')}</span>
      </div>
    </div>
  );
}

/**
 * Phrases quick link widget for 2-column layout
 */
export function PhrasesWidget() {
  return (
    <Link
      href="/phrases"
      className="card p-3 flex flex-col items-center justify-center text-center hover:bg-background-secondary transition-colors active:scale-95"
    >
      <span className="text-2xl mb-1" aria-hidden="true">🗣️</span>
      <span className="text-sm font-medium text-foreground">Phrases</span>
      <span className="text-xs text-foreground-tertiary">Japanese</span>
    </Link>
  );
}
