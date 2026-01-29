'use client';

import Image from 'next/image';
import Link from 'next/link';
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
  CityOverviewCard,
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
        <div className="flex flex-col items-center pt-2 relative">
          {/* Settings gear - top right */}
          <Link
            href="/settings"
            className="absolute right-0 top-2 p-2 text-foreground-tertiary hover:text-foreground transition-colors"
            aria-label="Settings"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>

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

          {/* City overview - learn about current city */}
          <CityOverviewCard />

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
