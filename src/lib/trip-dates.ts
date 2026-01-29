/**
 * Trip date utilities
 * The trip runs from March 6-21, 2026 (15 days)
 */

// Trip start date (Day 1)
export const TRIP_START = new Date('2026-03-06T00:00:00+09:00');

// Trip end date (Day 15)
export const TRIP_END = new Date('2026-03-21T23:59:59+09:00');

// Total trip days
export const TOTAL_DAYS = 15;

/**
 * Get the current trip day number (1-15)
 * Returns null if before or after the trip
 */
export function getTripDay(date: Date = new Date()): number | null {
  // Convert to Japan time for comparison
  const japanTime = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
  const tripStartLocal = new Date(TRIP_START.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
  const tripEndLocal = new Date(TRIP_END.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));

  if (japanTime < tripStartLocal || japanTime > tripEndLocal) {
    return null;
  }

  // Calculate day difference
  const msPerDay = 24 * 60 * 60 * 1000;
  const dayDiff = Math.floor((japanTime.getTime() - tripStartLocal.getTime()) / msPerDay);

  return Math.min(Math.max(dayDiff + 1, 1), TOTAL_DAYS);
}

/**
 * Get the date for a specific trip day (1-15)
 */
export function getTripDate(dayNumber: number): Date {
  const date = new Date(TRIP_START);
  date.setDate(date.getDate() + dayNumber - 1);
  return date;
}

/**
 * Format a trip day's date
 */
export function formatTripDate(dayNumber: number, format: 'short' | 'long' = 'short'): string {
  const date = getTripDate(dayNumber);

  if (format === 'short') {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: 'Asia/Tokyo',
    });
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Tokyo',
  });
}

/**
 * Check if we're currently on the trip
 */
export function isOnTrip(date: Date = new Date()): boolean {
  return getTripDay(date) !== null;
}

/**
 * Check if the trip is upcoming (before start)
 */
export function isTripUpcoming(date: Date = new Date()): boolean {
  const japanTime = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
  const tripStartLocal = new Date(TRIP_START.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
  return japanTime < tripStartLocal;
}

/**
 * Get days until trip starts
 */
export function getDaysUntilTrip(date: Date = new Date()): number {
  const japanTime = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
  const tripStartLocal = new Date(TRIP_START.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));

  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.ceil((tripStartLocal.getTime() - japanTime.getTime()) / msPerDay);
}

/**
 * City for each day of the trip
 */
export const DAY_CITIES: Record<number, string> = {
  1: 'Tokyo',
  2: 'Tokyo',
  3: 'Tokyo',
  4: 'Tokyo',
  5: 'Tokyo',
  6: 'Hakone',
  7: 'Hakone',
  8: 'Kyoto',
  9: 'Kyoto',
  10: 'Kyoto',
  11: 'Kyoto',
  12: 'Osaka',
  13: 'Osaka',
  14: 'Osaka',
  15: 'Tokyo', // Return flight
};

/**
 * Get the city for a specific trip day
 */
export function getCityForDay(dayNumber: number): string | null {
  return DAY_CITIES[dayNumber] ?? null;
}

/**
 * List of all cities on the trip
 */
export const TRIP_CITIES = ['Tokyo', 'Hakone', 'Kyoto', 'Osaka'];
