/**
 * Safe JSON parsing utilities
 *
 * Provides error-safe JSON parsing to prevent app crashes from corrupted
 * IndexedDB data or malformed API responses.
 */

/**
 * Safely parses a JSON string, returning a fallback value on parse failure.
 *
 * @param json - The JSON string to parse (can be null/undefined)
 * @param fallback - The value to return if parsing fails
 * @returns The parsed value or fallback
 *
 * @example
 * const data = safeJsonParse(maybeJson, []);
 * const config = safeJsonParse(configStr, { enabled: false });
 */
export function safeJsonParse<T>(json: string | null | undefined, fallback: T): T {
  if (json === null || json === undefined || json === '') {
    return fallback;
  }

  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Safely parses a JSON string that should contain an array.
 * Returns an empty array if parsing fails or result is not an array.
 *
 * @param json - The JSON string to parse
 * @returns The parsed array or empty array
 */
export function safeJsonParseArray<T>(json: string | null | undefined): T[] {
  const result = safeJsonParse(json, []);
  return Array.isArray(result) ? result : [];
}
