'use client';

import { useState, useEffect } from 'react';
import {
  DashboardLayout,
  NowWidget,
  NextWidget,
  WeatherWidget,
  TimeWidget,
  AlertBanner,
} from '@/components/dashboard';
import { DayStrip } from '@/components/ui';
import { useCurrentDayNumber } from '@/db/hooks';
import { useSyncStore, formatLastSyncTime } from '@/stores/sync-store';

export default function Home() {
  const [hasMounted, setHasMounted] = useState(false);
  const { isSyncing, isOnline, lastSyncedAt } = useSyncStore();
  const currentDayNumber = useCurrentDayNumber();

  // Selected day - null means "follow current day"
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Effective day: user selection takes precedence, otherwise current day, otherwise day 1
  const effectiveSelectedDay = selectedDay ?? currentDayNumber ?? 1;

  // Prevent hydration mismatch by only showing sync status after mount
  // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional for hydration fix
  useEffect(() => setHasMounted(true), []);

  return (
    <DashboardLayout
      header={
        <div className="flex flex-col gap-2 pt-2">
          {/* App title */}
          <div className="flex items-center justify-between px-4">
            <h1 className="font-display text-display-sm text-foreground">FTC: Nihon</h1>

            {/* Sync status indicator - only render after mount to avoid hydration mismatch */}
            <div
              className="flex items-center gap-2 text-xs text-foreground-tertiary"
              data-testid="sync-status"
              aria-live="polite"
            >
              {hasMounted && (
                <>
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
                </>
              )}
            </div>
          </div>

          {/* Day strip navigation */}
          <DayStrip
            selectedDay={effectiveSelectedDay}
            currentDay={currentDayNumber}
            onDayChange={setSelectedDay}
          />
        </div>
      }
    >
      {/* Alert banner - shows urgent alerts and approaching deadlines */}
      <AlertBanner />

      {/* NOW widget - current activity */}
      <NowWidget />

      {/* NEXT widget - upcoming activity with leave by time */}
      <NextWidget />

      {/* Weather and Time widgets */}
      <WeatherWidget />
      <TimeWidget />
    </DashboardLayout>
  );
}
