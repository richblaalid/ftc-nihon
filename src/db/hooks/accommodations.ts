/**
 * Accommodation-related hooks
 * Provides access to hotel and lodging data
 */

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../database';
import { useSyncVersion } from './sync';
import { getCurrentDate } from '@/lib/utils';
import { TRIP_START_DATE } from '@/types/database';
import type { Accommodation } from '@/types/database';

/**
 * Get date string for a given day number (timezone-safe)
 * Day 0 = TRIP_START_DATE
 */
function getDateForDay(dayNumber: number): string {
  // Parse TRIP_START_DATE as local date to avoid timezone issues
  const [year, month, day] = TRIP_START_DATE.split('-').map(Number);
  if (!year || !month || !day) return '';

  // Create date in local timezone (noon to avoid DST issues)
  const tripStart = new Date(year, month - 1, day, 12, 0, 0);
  const targetDate = new Date(tripStart);
  targetDate.setDate(tripStart.getDate() + dayNumber);

  // Format as YYYY-MM-DD
  const y = targetDate.getFullYear();
  const m = String(targetDate.getMonth() + 1).padStart(2, '0');
  const d = String(targetDate.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Get all accommodations
 */
export function useAccommodations(): Accommodation[] | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(() => db.accommodations.orderBy('sortOrder').toArray(), [syncVersion]);
}

/**
 * Get current accommodation based on date
 */
export function useCurrentAccommodation(date?: string): Accommodation | undefined {
  const syncVersion = useSyncVersion();
  const targetDate = date ?? getCurrentDate().toISOString().split('T')[0] ?? '';

  return useLiveQuery(
    () =>
      db.accommodations
        .filter((acc) => targetDate !== '' && acc.startDate <= targetDate && acc.endDate >= targetDate)
        .first(),
    [targetDate, syncVersion]
  );
}

/**
 * Get accommodations relevant to a specific day
 * Returns: { lastNight, tonight } - the hotel from the night before and tonight's hotel
 */
export function useAccommodationsForDay(dayNumber: number): { lastNight: Accommodation | null; tonight: Accommodation | null } | undefined {
  return useLiveQuery(async () => {
    const todayDate = getDateForDay(dayNumber);
    const yesterdayDate = dayNumber > 1 ? getDateForDay(dayNumber - 1) : '';

    const accommodations = await db.accommodations.toArray();

    // Tonight's hotel: date falls within startDate-endDate
    // Note: endDate is checkout day, so we check if todayDate < endDate (not <=)
    const tonight = accommodations.find(
      (acc) => acc.startDate <= todayDate && todayDate < acc.endDate
    ) ?? null;

    // Last night's hotel: yesterday's date falls within startDate-endDate
    const lastNight = yesterdayDate
      ? accommodations.find(
          (acc) => acc.startDate <= yesterdayDate && yesterdayDate < acc.endDate
        ) ?? null
      : null;

    return { lastNight, tonight };
  }, [dayNumber]);
}
