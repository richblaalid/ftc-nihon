'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  DashboardLayout,
  NowWidget,
  NextWidget,
  TimeWidgetCompact,
  WeatherWidgetCompact,
  AlertBanner,
  QuickActions,
  TripCountdown,
  TripPrepCard,
} from '@/components/dashboard';
import { useSyncStore, formatLastSyncTime } from '@/stores/sync-store';
import { forceResync } from '@/lib/sync';
import {
  useTripInfo,
  useFlight,
  useUnpurchasedTickets,
  useCurrentDayNumber,
} from '@/db/hooks';
import { FlightCard } from '@/components/ui/FlightCard';
import { TicketCardCompact } from '@/components/ui/TicketCard';
import { EmergencySheet, EmergencyButton, useEmergencySheet } from '@/components/ui/EmergencySheet';

export default function Home() {
  const [hasMounted, setHasMounted] = useState(false);
  const { isSyncing, isOnline, lastSyncedAt, setIsSyncing, setLastSyncedAt } = useSyncStore();

  // Enriched data hooks
  const tripInfo = useTripInfo();
  const currentDayNumber = useCurrentDayNumber();
  const outboundFlight = useFlight('outbound');
  const returnFlight = useFlight('return');
  const unpurchasedTickets = useUnpurchasedTickets();

  // Emergency sheet state
  const emergencySheet = useEmergencySheet();

  // Prevent hydration mismatch by only showing sync status after mount
  // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional for hydration fix
  useEffect(() => setHasMounted(true), []);

  // Sync feedback state
  const [syncFeedback, setSyncFeedback] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncError, setSyncError] = useState<string | null>(null);

  // Handle manual refresh with visible feedback
  const handleRefresh = async () => {
    if (syncFeedback === 'syncing' || !isOnline) return;

    setSyncFeedback('syncing');
    setSyncError(null);
    setIsSyncing(true);

    // Minimum display time so user sees feedback
    const minDisplayTime = new Promise((resolve) => setTimeout(resolve, 800));

    try {
      const [result] = await Promise.all([forceResync(), minDisplayTime]);
      if (result.success) {
        setLastSyncedAt(new Date().toISOString());
        setSyncFeedback('success');
      } else {
        setSyncFeedback('error');
        setSyncError(result.error || 'Unknown error');
        console.error('[Sync] Failed:', result.error);
      }
    } catch (err) {
      setSyncFeedback('error');
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setSyncError(errorMsg);
      console.error('[Sync] Exception:', err);
    } finally {
      setIsSyncing(false);
      // Reset feedback after showing result
      setTimeout(() => setSyncFeedback('idle'), 3000);
    }
  };

  // Determine which flight to show based on current day
  // Day 1 (or before trip): show outbound, Day 15-16: show return
  const isPreTrip = currentDayNumber === null || currentDayNumber < 1;
  const isDepartureDay = currentDayNumber === 1;
  const isReturnDay = currentDayNumber === 15 || currentDayNumber === 16;
  const relevantFlight = isDepartureDay ? outboundFlight : isReturnDay ? returnFlight : isPreTrip ? outboundFlight : null;

  return (
    <DashboardLayout
      header={
        <div className="flex flex-col items-center pt-2">
          {/* Branded header with logo - compact horizontal layout */}
          <div className="flex items-center justify-center gap-1">
            <h1 className="font-display text-2xl text-foreground tracking-wide">
              日本
            </h1>
            <Image
              src="/ftc-nihon-logo.png"
              alt="Finer Things Club: Nihon"
              width={72}
              height={72}
              className="drop-shadow-lg"
              priority
            />
            <span className="font-display text-2xl text-foreground tracking-wide">
              2026
            </span>
          </div>

        </div>
      }
    >
      {/* Alert banner - shows urgent alerts and approaching deadlines */}
      <AlertBanner />

      {/* PRE-TRIP CONTENT */}
      {isPreTrip && (
        <>
          {/* Countdown to trip */}
          <TripCountdown />

          {/* Flight info */}
          {outboundFlight && (
            <section aria-labelledby="flight-heading">
              <h2 id="flight-heading" className="sr-only">Upcoming Flight</h2>
              <FlightCard flight={outboundFlight} />
            </section>
          )}

          {/* Trip preparation checklist */}
          <TripPrepCard />

          {/* Unpurchased tickets reminder */}
          {unpurchasedTickets && unpurchasedTickets.length > 0 && (
            <section aria-labelledby="tickets-heading" className="card">
              <h2 id="tickets-heading" className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="text-amber-500">🎫</span>
                Tickets to Purchase
              </h2>
              <div className="space-y-2">
                {unpurchasedTickets.map((ticket) => (
                  <TicketCardCompact key={ticket.id} ticket={ticket} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* DURING-TRIP CONTENT */}
      {!isPreTrip && (
        <>
          {/* Flight info on relevant days */}
          {relevantFlight && (
            <section aria-labelledby="flight-heading">
              <h2 id="flight-heading" className="sr-only">
                {isDepartureDay ? 'Departure Flight' : isReturnDay ? 'Return Flight' : 'Flight Info'}
              </h2>
              <FlightCard flight={relevantFlight} />
            </section>
          )}

          {/* NOW widget - current activity */}
          <NowWidget />

          {/* NEXT widget - upcoming activity with leave by time */}
          <NextWidget />

          {/* Unpurchased tickets reminder */}
          {unpurchasedTickets && unpurchasedTickets.length > 0 && (
            <section aria-labelledby="tickets-heading" className="card">
              <h2 id="tickets-heading" className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="text-amber-500">🎫</span>
                Tickets to Purchase
              </h2>
              <div className="space-y-2">
                {unpurchasedTickets.map((ticket) => (
                  <TicketCardCompact key={ticket.id} ticket={ticket} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Utility widgets row: Weather, Currency, Translate */}
      <QuickActions />

      {/* Weather and Time - 2-column layout */}
      <div className="grid grid-cols-2 gap-3">
        <WeatherWidgetCompact />
        <TimeWidgetCompact />
      </div>

      {/* Sync refresh button - at bottom */}
      {hasMounted && (
        <button
          onClick={handleRefresh}
          disabled={syncFeedback === 'syncing' || !isOnline}
          className="w-full py-3 text-sm text-foreground-tertiary hover:text-foreground-secondary active:bg-background-secondary rounded-lg transition-all disabled:opacity-50"
          data-testid="sync-status"
        >
          {syncFeedback === 'syncing' ? (
            <span className="flex items-center justify-center gap-2 text-primary">
              <span className="h-2 w-2 rounded-full bg-primary animate-ping" aria-hidden="true" />
              Refreshing data...
            </span>
          ) : syncFeedback === 'success' ? (
            <span className="flex items-center justify-center gap-2 text-success">
              <span className="h-2 w-2 rounded-full bg-success" aria-hidden="true" />
              Sync complete!
            </span>
          ) : syncFeedback === 'error' ? (
            <span className="flex flex-col items-center gap-1 text-error">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-error" aria-hidden="true" />
                Sync failed - tap to retry
              </span>
              {syncError && (
                <span className="text-xs text-foreground-tertiary">{syncError}</span>
              )}
            </span>
          ) : !isOnline ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-2 w-2 rounded-full bg-warning" aria-hidden="true" />
              Offline - can&apos;t refresh
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span className="h-2 w-2 rounded-full bg-success" aria-hidden="true" />
              {lastSyncedAt ? `Synced ${formatLastSyncTime(lastSyncedAt)}` : 'Not synced'}
              <span>· Tap to refresh</span>
            </span>
          )}
        </button>
      )}

      {/* Emergency button - floating action */}
      {tripInfo && <EmergencyButton onClick={emergencySheet.open} />}

      {/* Emergency sheet */}
      {tripInfo && (
        <EmergencySheet
          tripInfo={tripInfo}
          isOpen={emergencySheet.isOpen}
          onClose={emergencySheet.close}
        />
      )}
    </DashboardLayout>
  );
}
