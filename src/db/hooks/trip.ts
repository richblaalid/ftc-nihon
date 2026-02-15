/**
 * Trip and day info hooks
 * Provides access to trip-level data and day information
 */

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../database';
import { useSyncVersion } from './sync';
import { getCurrentDate, getJapanDateString } from '@/lib/utils';
import { TRIP_START_DATE } from '@/types/database';
import type {
  TripInfo,
  DayInfo,
  Flight,
  FlightType,
  Ticket,
  TransportRoute,
} from '@/types/database';

/**
 * Get trip info (guide contact, emergency numbers)
 * Returns single record or undefined
 */
export function useTripInfo(): TripInfo | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(() => db.tripInfo.toCollection().first(), [syncVersion]);
}

/**
 * Get day info for a specific day number
 */
export function useDayInfo(dayNumber: number): DayInfo | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(
    () => db.dayInfo.where('dayNumber').equals(dayNumber).first(),
    [dayNumber, syncVersion]
  );
}

/**
 * Get all day info records
 */
export function useAllDayInfo(): DayInfo[] | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(() => db.dayInfo.orderBy('dayNumber').toArray(), [syncVersion]);
}

/**
 * Calculate the current trip day number (0-15)
 * Day 0 = departure from MSP, Day 1 = arrival in Tokyo
 * Returns null if outside trip dates
 */
export function useCurrentDayNumber(): number | null {
  const now = getCurrentDate();
  // Get current date in Japan timezone to match trip dates
  const todayJapan = getJapanDateString(now);

  if (!todayJapan) return null;

  // Parse both dates as noon local to avoid timezone edge cases
  const [tripYear, tripMonth, tripDay] = TRIP_START_DATE.split('-').map(Number);
  const [todayYear, todayMonth, todayDay] = todayJapan.split('-').map(Number);

  if (!tripYear || !tripMonth || !tripDay || !todayYear || !todayMonth || !todayDay) {
    return null;
  }

  // Create dates at noon to avoid DST issues
  const tripStart = new Date(tripYear, tripMonth - 1, tripDay, 12, 0, 0);
  const todayDate = new Date(todayYear, todayMonth - 1, todayDay, 12, 0, 0);

  const diffTime = todayDate.getTime() - tripStart.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  // Day 0 starts on TRIP_START_DATE (departure day)
  const dayNumber = diffDays;

  if (dayNumber < 0 || dayNumber > 15) return null;

  return dayNumber;
}

/**
 * Get all flights
 */
export function useFlights(): Flight[] | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(() => db.flights.toArray(), [syncVersion]);
}

/**
 * Get a specific flight by type (outbound or return)
 */
export function useFlight(type: FlightType): Flight | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(() => db.flights.where('type').equals(type).first(), [type, syncVersion]);
}

/**
 * Get all tickets (purchased and unpurchased)
 */
export function useTickets(): Ticket[] | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(() => db.tickets.orderBy('sortOrder').toArray(), [syncVersion]);
}

/**
 * Get a specific ticket by ID
 */
export function useTicket(ticketId: string | null): Ticket | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(
    () => (ticketId ? db.tickets.get(ticketId) : undefined),
    [ticketId, syncVersion]
  );
}

/**
 * Get tickets that need to be purchased (status = 'not_purchased')
 */
export function useUnpurchasedTickets(): Ticket[] | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(
    () => db.tickets.where('status').equals('not_purchased').sortBy('sortOrder'),
    [syncVersion]
  );
}

/**
 * Get all transport routes
 */
export function useTransportRoutes(): TransportRoute[] | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(() => db.transportRoutes.toArray(), [syncVersion]);
}
