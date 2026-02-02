/**
 * Utility functions for FTC: Nihon
 */

/**
 * Get the current date/time, with optional debug override.
 *
 * Set NEXT_PUBLIC_DEBUG_DATE in .env.local to simulate being on the trip:
 * - NEXT_PUBLIC_DEBUG_DATE=2026-03-08T10:30:00 (Day 3, 10:30 AM)
 * - NEXT_PUBLIC_DEBUG_DATE=2026-03-06T09:00:00 (Day 1, 9:00 AM)
 *
 * Leave unset for real current date/time.
 */
export function getCurrentDate(): Date {
  const debugDate = process.env.NEXT_PUBLIC_DEBUG_DATE;

  if (debugDate) {
    const parsed = new Date(debugDate);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
    console.warn(`Invalid NEXT_PUBLIC_DEBUG_DATE: ${debugDate}, using real date`);
  }

  return new Date();
}

/**
 * Format a date as ISO date string (YYYY-MM-DD) in UTC
 * Note: For trip-related dates, use getJapanDateString instead
 */
export function formatISODate(date: Date): string {
  return date.toISOString().split('T')[0] ?? '';
}

/**
 * Get the current date string in Japan timezone (YYYY-MM-DD)
 * This is the correct format for comparing against trip dates
 */
export function getJapanDateString(date: Date = new Date()): string {
  // Format date in Japan timezone to get correct local date
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date); // Returns YYYY-MM-DD format
}

/**
 * Format time as HH:MM
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}
