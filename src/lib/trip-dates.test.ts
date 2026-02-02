import { describe, it, expect } from 'vitest';
import {
  TRIP_START,
  TRIP_END,
  TOTAL_DAYS,
  getTripDay,
  getTripDate,
  formatTripDate,
  isOnTrip,
  isTripUpcoming,
  getDaysUntilTrip,
  DAY_CITIES,
} from './trip-dates';

describe('trip-dates', () => {
  describe('constants', () => {
    it('has correct trip start date', () => {
      // Use Japan timezone for assertions since dates are stored in JST
      const startInJapan = TRIP_START.toLocaleDateString('en-US', {
        timeZone: 'Asia/Tokyo',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      });
      expect(startInJapan).toBe('3/6/2026');
    });

    it('has correct trip end date', () => {
      expect(TRIP_END.getFullYear()).toBe(2026);
      expect(TRIP_END.getMonth()).toBe(2); // March (0-indexed)
      expect(TRIP_END.getDate()).toBe(21);
    });

    it('has correct total days', () => {
      expect(TOTAL_DAYS).toBe(16);
    });

    it('has city for each day', () => {
      for (let day = 0; day < TOTAL_DAYS; day++) {
        expect(DAY_CITIES[day]).toBeDefined();
        expect(typeof DAY_CITIES[day]).toBe('string');
      }
    });

    it('has correct city assignments', () => {
      // Day 0 - Travel (departure)
      expect(DAY_CITIES[0]).toBe('Travel');
      // Tokyo days 1-5
      expect(DAY_CITIES[1]).toBe('Tokyo');
      expect(DAY_CITIES[5]).toBe('Tokyo');
      // Hakone days 6-7
      expect(DAY_CITIES[6]).toBe('Hakone');
      expect(DAY_CITIES[7]).toBe('Hakone');
      // Kyoto days 8-10
      expect(DAY_CITIES[8]).toBe('Kyoto');
      expect(DAY_CITIES[10]).toBe('Kyoto');
      // Osaka days 11-14
      expect(DAY_CITIES[11]).toBe('Osaka');
      expect(DAY_CITIES[14]).toBe('Osaka');
      // Day 15 - Travel (return)
      expect(DAY_CITIES[15]).toBe('Travel');
    });
  });

  describe('getTripDay', () => {
    it('returns 0 for trip start date (departure day)', () => {
      const startDate = new Date('2026-03-06T12:00:00+09:00');
      expect(getTripDay(startDate)).toBe(0);
    });

    it('returns correct day for mid-trip date', () => {
      const midDate = new Date('2026-03-10T12:00:00+09:00');
      expect(getTripDay(midDate)).toBe(4);
    });

    it('returns 15 for trip end date (return flight)', () => {
      const endDate = new Date('2026-03-21T12:00:00+09:00');
      expect(getTripDay(endDate)).toBe(15);
    });

    it('returns null for date before trip', () => {
      const beforeTrip = new Date('2026-03-01T12:00:00+09:00');
      expect(getTripDay(beforeTrip)).toBeNull();
    });

    it('returns null for date after trip', () => {
      const afterTrip = new Date('2026-03-25T12:00:00+09:00');
      expect(getTripDay(afterTrip)).toBeNull();
    });
  });

  describe('getTripDate', () => {
    it('returns correct date for day 0 (departure)', () => {
      const date = getTripDate(0);
      const dateInJapan = date.toLocaleDateString('en-US', {
        timeZone: 'Asia/Tokyo',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      });
      expect(dateInJapan).toBe('3/6/2026');
    });

    it('returns correct date for day 15 (return)', () => {
      const date = getTripDate(15);
      // Verify the date offset is correct (15 days after day 0)
      const day0 = getTripDate(0);
      const daysDiff = Math.round((date.getTime() - day0.getTime()) / (24 * 60 * 60 * 1000));
      expect(daysDiff).toBe(15);
    });

    it('returns correct date for middle day', () => {
      const date = getTripDate(8);
      // Verify the date offset is correct (8 days after day 0)
      const day0 = getTripDate(0);
      const daysDiff = Math.round((date.getTime() - day0.getTime()) / (24 * 60 * 60 * 1000));
      expect(daysDiff).toBe(8);
    });
  });

  describe('formatTripDate', () => {
    it('formats short date correctly', () => {
      const result = formatTripDate(0, 'short');
      expect(result).toContain('Mar');
      expect(result).toContain('6');
    });

    it('formats long date correctly', () => {
      const result = formatTripDate(0, 'long');
      expect(result).toContain('March');
      expect(result).toContain('6');
      expect(result).toContain('2026');
      expect(result).toContain('Friday');
    });

    it('defaults to short format', () => {
      const result = formatTripDate(0);
      expect(result).toContain('Mar');
    });
  });

  describe('isOnTrip', () => {
    it('returns true during trip', () => {
      const duringTrip = new Date('2026-03-10T12:00:00+09:00');
      expect(isOnTrip(duringTrip)).toBe(true);
    });

    it('returns false before trip', () => {
      const beforeTrip = new Date('2026-03-01T12:00:00+09:00');
      expect(isOnTrip(beforeTrip)).toBe(false);
    });

    it('returns false after trip', () => {
      const afterTrip = new Date('2026-03-25T12:00:00+09:00');
      expect(isOnTrip(afterTrip)).toBe(false);
    });
  });

  describe('isTripUpcoming', () => {
    it('returns true before trip', () => {
      const beforeTrip = new Date('2026-03-01T12:00:00+09:00');
      expect(isTripUpcoming(beforeTrip)).toBe(true);
    });

    it('returns false during trip', () => {
      const duringTrip = new Date('2026-03-10T12:00:00+09:00');
      expect(isTripUpcoming(duringTrip)).toBe(false);
    });

    it('returns false after trip', () => {
      const afterTrip = new Date('2026-03-25T12:00:00+09:00');
      expect(isTripUpcoming(afterTrip)).toBe(false);
    });
  });

  describe('getDaysUntilTrip', () => {
    it('returns positive number before trip', () => {
      const beforeTrip = new Date('2026-03-01T12:00:00+09:00');
      const days = getDaysUntilTrip(beforeTrip);
      expect(days).toBeGreaterThan(0);
      expect(days).toBe(5);
    });

    it('returns 0 or negative during trip', () => {
      const duringTrip = new Date('2026-03-10T12:00:00+09:00');
      const days = getDaysUntilTrip(duringTrip);
      expect(days).toBeLessThanOrEqual(0);
    });

    it('returns large negative number after trip', () => {
      const afterTrip = new Date('2026-03-25T12:00:00+09:00');
      const days = getDaysUntilTrip(afterTrip);
      expect(days).toBeLessThan(-10);
    });
  });
});
