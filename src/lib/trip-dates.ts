/**
 * Trip date utilities
 * The trip runs from March 6-21, 2026 (16 days: Day 0-15)
 * Day 0 = Departure from MSP, Day 1 = Arrival in Tokyo, Day 15 = Return flight
 */

// Trip start date (Day 0 - departure day)
export const TRIP_START = new Date('2026-03-06T00:00:00+09:00');

// Trip end date (Day 15 - return flight)
export const TRIP_END = new Date('2026-03-21T23:59:59+09:00');

// Total trip days (0-15)
export const TOTAL_DAYS = 16;

/**
 * Get the current trip day number (0-15)
 * Day 0 = departure, Day 1 = arrival in Tokyo, Day 15 = return flight
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

  // Calculate day difference (0-indexed: Day 0 = first day)
  const msPerDay = 24 * 60 * 60 * 1000;
  const dayDiff = Math.floor((japanTime.getTime() - tripStartLocal.getTime()) / msPerDay);

  return Math.min(Math.max(dayDiff, 0), TOTAL_DAYS - 1);
}

/**
 * Get the date for a specific trip day (0-15)
 */
export function getTripDate(dayNumber: number): Date {
  const date = new Date(TRIP_START);
  date.setDate(date.getDate() + dayNumber);
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
 * City for each day of the trip (0-indexed, matches database.ts)
 */
export const DAY_CITIES: Record<number, string> = {
  0: 'Travel',  // Departure from Minneapolis (on plane)
  1: 'Tokyo',   // Arrive Tokyo
  2: 'Tokyo',
  3: 'Tokyo',
  4: 'Tokyo',
  5: 'Tokyo',
  6: 'Hakone',
  7: 'Hakone',
  8: 'Kyoto',
  9: 'Kyoto',
  10: 'Kyoto',
  11: 'Osaka',
  12: 'Osaka',
  13: 'Osaka',
  14: 'Osaka',
  15: 'Travel', // Return flight
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
