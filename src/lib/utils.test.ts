import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getCurrentDate, formatISODate, formatTime } from './utils';

describe('utils', () => {
  describe('getCurrentDate', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      vi.resetModules();
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('returns current date when no debug date is set', () => {
      delete process.env.NEXT_PUBLIC_DEBUG_DATE;
      const before = new Date();
      const result = getCurrentDate();
      const after = new Date();

      expect(result.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(result.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('returns debug date when NEXT_PUBLIC_DEBUG_DATE is set', async () => {
      process.env.NEXT_PUBLIC_DEBUG_DATE = '2026-03-08T10:30:00';

      // Need to re-import to pick up new env - use dynamic import
      vi.resetModules();
      const { getCurrentDate: getDate } = await import('./utils');
      const result = getDate();

      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(2); // March (0-indexed)
      expect(result.getDate()).toBe(8);
    });

    it('returns real date when debug date is invalid', async () => {
      process.env.NEXT_PUBLIC_DEBUG_DATE = 'invalid-date';
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      vi.resetModules();
      const { getCurrentDate: getDate } = await import('./utils');
      const result = getDate();

      // Should return a valid date (current)
      expect(result instanceof Date).toBe(true);
      expect(isNaN(result.getTime())).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid NEXT_PUBLIC_DEBUG_DATE'));

      consoleSpy.mockRestore();
    });
  });

  describe('formatISODate', () => {
    it('formats date as YYYY-MM-DD', () => {
      const date = new Date('2026-03-15T14:30:00Z');
      const result = formatISODate(date);
      expect(result).toBe('2026-03-15');
    });

    it('handles single digit months and days', () => {
      const date = new Date('2026-01-05T00:00:00Z');
      const result = formatISODate(date);
      expect(result).toBe('2026-01-05');
    });

    it('handles year boundaries', () => {
      const date = new Date('2025-12-31T23:59:59Z');
      const result = formatISODate(date);
      expect(result).toBe('2025-12-31');
    });
  });

  describe('formatTime', () => {
    it('formats time in 24-hour format', () => {
      const date = new Date('2026-03-15T14:30:00');
      const result = formatTime(date);
      expect(result).toMatch(/14:30/);
    });

    it('handles midnight', () => {
      const date = new Date('2026-03-15T00:00:00');
      const result = formatTime(date);
      expect(result).toMatch(/00:00/);
    });

    it('handles noon', () => {
      const date = new Date('2026-03-15T12:00:00');
      const result = formatTime(date);
      expect(result).toMatch(/12:00/);
    });

    it('pads single digit hours and minutes', () => {
      const date = new Date('2026-03-15T09:05:00');
      const result = formatTime(date);
      expect(result).toMatch(/09:05/);
    });
  });
});
