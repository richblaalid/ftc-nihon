'use client';

import { safeJsonParse } from '@/lib/json-utils';
import type { Flight } from '@/types/database';

interface FlightCardProps {
  flight: Flight;
  className?: string;
}

/**
 * Flight information card with boarding pass aesthetic
 * Displays departure/arrival times, airports, and seat assignments
 */
export function FlightCard({ flight, className = '' }: FlightCardProps) {
  const isOutbound = flight.type === 'outbound';
  const seats = safeJsonParse<string[]>(flight.seats, []);

  // Format date for display
  const formatDate = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl
        bg-gradient-to-br from-category-transit via-category-transit/90 to-background-tertiary
        dark:from-category-transit/90 dark:via-category-transit/70 dark:to-background-tertiary
        text-white shadow-lg
        ${className}
      `}
    >
      {/* Decorative elements - boarding pass style */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" aria-hidden="true" />

      {/* Perforated edge effect */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-background dark:bg-background rounded-r-full" aria-hidden="true" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-background dark:bg-background rounded-l-full" aria-hidden="true" />

      <div className="relative p-5">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✈️</span>
            <div>
              <p className="text-xs text-white/60 uppercase tracking-wider font-medium">
                {isOutbound ? 'Outbound Flight' : 'Return Flight'}
              </p>
              <p className="text-sm font-semibold text-white/90">{flight.flightNumber}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/60 uppercase tracking-wider">Confirmation</p>
            <p className="text-sm font-mono font-bold tracking-wider text-secondary">{flight.confirmation}</p>
          </div>
        </div>

        {/* Route display - main visual element */}
        <div className="flex items-center justify-between my-6">
          {/* Departure */}
          <div className="text-center flex-1">
            <p className="text-3xl font-bold tracking-tight">{flight.departureAirport}</p>
            <p className="text-xs text-white/60 mt-1">
              {flight.departureTerminal && `Terminal ${flight.departureTerminal}`}
            </p>
          </div>

          {/* Flight path visualization */}
          <div className="flex-1 flex items-center justify-center px-3">
            <div className="flex items-center w-full">
              <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-white/50 to-white/50" />
              <div className="mx-2 text-white/50 text-lg transform rotate-90 md:rotate-0">
                {isOutbound ? '→' : '←'}
              </div>
              <div className="h-[2px] flex-1 bg-gradient-to-r from-white/50 via-white/50 to-transparent" />
            </div>
          </div>

          {/* Arrival */}
          <div className="text-center flex-1">
            <p className="text-3xl font-bold tracking-tight">{flight.arrivalAirport}</p>
            <p className="text-xs text-white/60 mt-1">
              {flight.arrivalTerminal && `Terminal ${flight.arrivalTerminal}`}
            </p>
          </div>
        </div>

        {/* Time details */}
        <div className="flex justify-between text-sm mb-4">
          <div>
            <p className="text-white/60 text-xs uppercase">Depart</p>
            <p className="font-semibold">{flight.departureLocalTime}</p>
            <p className="text-xs text-white/50">{formatDate(flight.departureDateTime)}</p>
          </div>
          <div className="text-center">
            <p className="text-white/60 text-xs uppercase">Duration</p>
            <p className="font-semibold">{flight.duration}</p>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-xs uppercase">Arrive</p>
            <p className="font-semibold">{flight.arrivalLocalTime}</p>
            <p className="text-xs text-white/50">{formatDate(flight.arrivalDateTime)}</p>
          </div>
        </div>

        {/* Divider with dots */}
        <div className="border-t border-dashed border-white/30 my-4 relative" aria-hidden="true">
          <div className="absolute -left-5 top-1/2 -translate-y-1/2 w-4 h-4 bg-background dark:bg-background rounded-full" />
          <div className="absolute -right-5 top-1/2 -translate-y-1/2 w-4 h-4 bg-background dark:bg-background rounded-full" />
        </div>

        {/* Bottom section - seats & aircraft */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/60 text-xs uppercase">Aircraft</p>
            <p className="text-sm">{flight.aircraft || 'TBD'}</p>
          </div>
          {seats.length > 0 && (
            <div className="text-right">
              <p className="text-white/60 text-xs uppercase">Seats</p>
              <div className="flex gap-1 justify-end">
                {seats.map((seat: string, i: number) => (
                  <span
                    key={i}
                    className="inline-flex items-center justify-center px-2 py-0.5 bg-secondary/20 text-secondary rounded text-xs font-mono font-bold"
                  >
                    {seat}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
