'use client';

import { useState } from 'react';
import {
  DashboardLayout,
  NowWidget,
  NextWidget,
  WeatherWidget,
  QuickActions,
  AlertBanner,
  DayIndicator,
} from '@/components/dashboard';
import { useSyncStore, formatLastSyncTime } from '@/stores/sync-store';

export default function Home() {
  const [selectedDay, setSelectedDay] = useState<number | undefined>(undefined);
  const { isSyncing, isOnline, lastSyncedAt } = useSyncStore();

  return (
    <DashboardLayout
      header={
        <div className="flex flex-col gap-3 pt-2">
          {/* App title */}
          <div className="flex items-center justify-between">
            <h1 className="font-display text-display-sm text-foreground">FTC: Nihon</h1>

            {/* Sync status indicator */}
            <div
              className="flex items-center gap-2 text-xs text-foreground-tertiary"
              data-testid="sync-status"
              aria-live="polite"
            >
              {isSyncing ? (
                <span className="animate-pulse">Syncing...</span>
              ) : !isOnline ? (
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-warning" aria-hidden="true" />
                  Offline
                </span>
              ) : lastSyncedAt ? (
                <span className="flex items-center gap-1" title={`Last synced: ${new Date(lastSyncedAt).toLocaleString()}`}>
                  <span className="h-2 w-2 rounded-full bg-success" aria-hidden="true" />
                  <time dateTime={lastSyncedAt}>
                    {formatLastSyncTime(lastSyncedAt)}
                  </time>
                </span>
              ) : null}
            </div>
          </div>

          {/* Day indicator */}
          <DayIndicator selectedDay={selectedDay} onDayChange={setSelectedDay} />
        </div>
      }
    >
      {/* Alert banner - shows urgent alerts and approaching deadlines */}
      <AlertBanner />

      {/* NOW widget - current activity */}
      <NowWidget />

      {/* NEXT widget - upcoming activity with leave by time */}
      <NextWidget />

      {/* Weather widget */}
      <WeatherWidget />

      {/* Quick action buttons */}
      <QuickActions />
    </DashboardLayout>
  );
}
