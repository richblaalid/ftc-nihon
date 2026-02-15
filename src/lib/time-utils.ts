/**
 * Time utilities for Japan timezone operations
 *
 * All trip data uses Japan timezone (Asia/Tokyo). These utilities ensure
 * consistent timezone handling across the app, especially important when
 * users are planning from outside Japan.
 */

/**
 * Get the current time in Japan timezone
 */
export function getJapanTime(date: Date = new Date()): { hours: number; minutes: number } {
  const timeStr = date.toLocaleTimeString('en-US', {
    timeZone: 'Asia/Tokyo',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const [hours, minutes] = timeStr.split(':').map(Number);
  return { hours: hours ?? 0, minutes: minutes ?? 0 };
}

/**
 * Get the current time in Japan timezone as HH:MM string
 */
export function getJapanTimeString(date: Date = new Date()): string {
  return date.toLocaleTimeString('en-US', {
    timeZone: 'Asia/Tokyo',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Parse a time string (HH:MM) to minutes since midnight
 * Returns null if the string is invalid
 */
export function parseTimeToMinutes(time: string): number | null {
  if (!time || !time.includes(':')) return null;
  const [hours, minutes] = time.split(':').map(Number);
  if (hours === undefined || minutes === undefined || isNaN(hours) || isNaN(minutes)) {
    return null;
  }
  return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight to HH:MM string
 */
export function minutesToTimeString(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Format 24-hour time to 12-hour display format
 * e.g., "14:30" -> "2:30 PM"
 */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  if (hours === undefined || minutes === undefined) return time;

  const suffix = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${suffix}`;
}

/**
 * Format a duration in minutes as a human-readable string
 * e.g., 90 -> "1h 30m", 45 -> "45m", 120 -> "2h"
 */
export function formatDuration(totalMinutes: number): string {
  if (totalMinutes < 60) {
    return `${totalMinutes}m`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

/**
 * Calculate time until a given time string, using Japan timezone
 * Returns a human-readable string like "in 2h 30m" or "in 45m"
 *
 * @param startTime - Target time in HH:MM format
 * @param now - Optional current date (defaults to new Date())
 */
export function getTimeUntil(startTime: string, now: Date = new Date()): string {
  const startMinutes = parseTimeToMinutes(startTime);
  if (startMinutes === null) return '';

  const japanTime = getJapanTime(now);
  const nowMinutes = japanTime.hours * 60 + japanTime.minutes;

  let diffMinutes = startMinutes - nowMinutes;

  // If negative, it's tomorrow
  if (diffMinutes < 0) {
    diffMinutes += 24 * 60;
  }

  return `in ${formatDuration(diffMinutes)}`;
}

/**
 * Check if a time falls within a range (all in HH:MM format)
 */
export function isTimeBetween(time: string, start: string, end: string): boolean {
  const t = parseTimeToMinutes(time);
  const s = parseTimeToMinutes(start);
  const e = parseTimeToMinutes(end);
  if (t === null || s === null || e === null) return false;
  return t >= s && t <= e;
}

/**
 * Calculate end time given start time and duration
 * Returns time in HH:MM format
 */
export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const startMinutes = parseTimeToMinutes(startTime);
  if (startMinutes === null) return startTime;
  return minutesToTimeString(startMinutes + durationMinutes);
}
