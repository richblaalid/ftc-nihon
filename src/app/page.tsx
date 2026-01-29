'use client';

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
  // Enriched data hooks
  const tripInfo = useTripInfo();
  const currentDayNumber = useCurrentDayNumber();
  const outboundFlight = useFlight('outbound');
  const returnFlight = useFlight('return');
  const unpurchasedTickets = useUnpurchasedTickets();

  // Emergency sheet state
  const emergencySheet = useEmergencySheet();

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
