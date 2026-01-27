'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  DashboardLayout,
  NowWidget,
  NextWidget,
  WeatherWidget,
  TimeWidget,
  AlertBanner,
} from '@/components/dashboard';
import { useSyncStore, formatLastSyncTime } from '@/stores/sync-store';

export default function Home() {
  const [hasMounted, setHasMounted] = useState(false);
  const { isSyncing, isOnline, lastSyncedAt } = useSyncStore();

  // Prevent hydration mismatch by only showing sync status after mount
  // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional for hydration fix
  useEffect(() => setHasMounted(true), []);

  return (
    <DashboardLayout
      header={
        <div className="flex flex-col items-center pt-2">
          {/* Branded header with logo */}
          <div className="relative flex flex-col items-center">
            <Image
              src="/ftc-nihon-logo.png"
              alt="Finer Things Club: Nihon"
              width={140}
              height={140}
              className="drop-shadow-lg"
              priority
            />
            <h1 className="font-display text-display-sm text-foreground -mt-2">
              日本 2026
            </h1>
          </div>

          {/* Sync status indicator - subtle, below header */}
          <div
            className="mt-1 flex items-center gap-2 text-xs text-foreground-tertiary"
            data-testid="sync-status"
            aria-live="polite"
          >
            {hasMounted && (
              <>
                {isSyncing ? (
                  <span className="animate-pulse">Syncing...</span>
                ) : !isOnline ? (
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-warning" aria-hidden="true" />
                    Offline
                  </span>
                ) : lastSyncedAt ? (
                  <span className="flex items-center gap-1" title={`Last synced: ${new Date(lastSyncedAt).toLocaleString()}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
                    <time dateTime={lastSyncedAt}>
                      {formatLastSyncTime(lastSyncedAt)}
                    </time>
                  </span>
                ) : null}
              </>
            )}
          </div>
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
