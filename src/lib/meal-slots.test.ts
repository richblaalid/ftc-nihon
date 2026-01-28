import { describe, it, expect } from 'vitest';
import type { Activity, MealPlan } from '@/types/database';
import {
  getMealSlotsForDay,
  shouldShowMealOptions,
  getMealSlotPosition,
  type MealSlot,
} from './meal-slots';

// Helper to create mock activity
function createActivity(overrides: Partial<Activity> = {}): Activity {
  return {
    id: 'test-1',
    dayNumber: 1,
    date: '2026-03-06',
    startTime: '10:00',
    durationMinutes: 60,
    name: 'Test Activity',
    category: 'activity',
    locationName: null,
    locationAddress: null,
    locationAddressJp: null,
    locationLat: null,
    locationLng: null,
    googleMapsUrl: null,
    websiteUrl: null,
    description: null,
    tips: null,
    whatToOrder: null,
    backupAlternative: null,
    isHardDeadline: false,
    isKidFriendly: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('meal-slots', () => {
  describe('getMealSlotsForDay', () => {
    it('returns all three meal slots for a normal day', () => {
      const activities: Activity[] = [];
      const slots = getMealSlotsForDay(5, activities);

      expect(slots.length).toBe(3);
      expect(slots.map(s => s.meal)).toContain('breakfast');
      expect(slots.map(s => s.meal)).toContain('lunch');
      expect(slots.map(s => s.meal)).toContain('dinner');
    });

    it('marks ryokan dinner as not showing options on day 7', () => {
      const activities: Activity[] = [];
      const slots = getMealSlotsForDay(7, activities);

      const dinnerSlot = slots.find(s => s.meal === 'dinner');
      expect(dinnerSlot).toBeDefined();
      expect(dinnerSlot?.showOptions).toBe(false);
      expect(dinnerSlot?.reason).toContain('Ryokan');
    });

    it('marks ryokan breakfast as not showing options on day 8', () => {
      const activities: Activity[] = [];
      const slots = getMealSlotsForDay(8, activities);

      const breakfastSlot = slots.find(s => s.meal === 'breakfast');
      expect(breakfastSlot).toBeDefined();
      expect(breakfastSlot?.showOptions).toBe(false);
      expect(breakfastSlot?.reason).toContain('Ryokan');
    });

    it('sorts slots by time', () => {
      const activities: Activity[] = [];
      const slots = getMealSlotsForDay(5, activities);

      // Breakfast should be first, then lunch, then dinner
      expect(slots[0]?.meal).toBe('breakfast');
      expect(slots[1]?.meal).toBe('lunch');
      expect(slots[2]?.meal).toBe('dinner');
    });

    it('respects meal plan hotel breakfast', () => {
      const activities: Activity[] = [];
      const dayInfo = {
        id: 'day-1',
        dayNumber: 1,
        date: '2026-03-06',
        dayOfWeek: 'Friday',
        title: 'Test Day',
        location: 'Tokyo',
        type: 'self_guided' as const,
        accommodationId: null,
        highlights: null,
        hardDeadlines: null,
        meals: JSON.stringify({ breakfast: 'Hotel breakfast included', lunch: null, dinner: null }),
        optimizationNote: null,
        transitSummary: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const slots = getMealSlotsForDay(1, activities, dayInfo);
      const breakfastSlot = slots.find(s => s.meal === 'breakfast');

      expect(breakfastSlot?.showOptions).toBe(false);
      expect(breakfastSlot?.reason).toContain('Hotel');
    });
  });

  describe('shouldShowMealOptions', () => {
    it('returns true for normal day and meal', () => {
      expect(shouldShowMealOptions(5, 'lunch')).toBe(true);
      expect(shouldShowMealOptions(5, 'dinner')).toBe(true);
      expect(shouldShowMealOptions(5, 'breakfast')).toBe(true);
    });

    it('returns false for ryokan dinner on day 7', () => {
      expect(shouldShowMealOptions(7, 'dinner')).toBe(false);
    });

    it('returns false for ryokan breakfast on day 8', () => {
      expect(shouldShowMealOptions(8, 'breakfast')).toBe(false);
    });

    it('returns true for other meals on ryokan days', () => {
      expect(shouldShowMealOptions(7, 'breakfast')).toBe(true);
      expect(shouldShowMealOptions(7, 'lunch')).toBe(true);
      expect(shouldShowMealOptions(8, 'lunch')).toBe(true);
      expect(shouldShowMealOptions(8, 'dinner')).toBe(true);
    });

    it('respects meal plan indicating hotel breakfast', () => {
      const mealPlan: MealPlan = { breakfast: 'Hotel breakfast', lunch: null, dinner: null };
      expect(shouldShowMealOptions(1, 'breakfast', mealPlan)).toBe(false);
    });

    it('respects meal plan indicating included meal', () => {
      const mealPlan: MealPlan = { breakfast: null, lunch: null, dinner: 'Included with accommodation' };
      expect(shouldShowMealOptions(1, 'dinner', mealPlan)).toBe(false);
    });

    it('shows options when meal plan does not indicate inclusion', () => {
      const mealPlan: MealPlan = { breakfast: null, lunch: 'Try local restaurant', dinner: null };
      expect(shouldShowMealOptions(1, 'lunch', mealPlan)).toBe(true);
    });
  });

  describe('getMealSlotPosition', () => {
    it('returns -1 for empty activities list', () => {
      const mealSlot: MealSlot = {
        meal: 'lunch',
        suggestedTime: '12:30',
        showOptions: true,
      };

      expect(getMealSlotPosition(mealSlot, [])).toBe(-1);
    });

    it('returns -1 when meal is before all activities', () => {
      const mealSlot: MealSlot = {
        meal: 'breakfast',
        suggestedTime: '08:00',
        showOptions: true,
      };

      const activities = [
        createActivity({ startTime: '10:00', durationMinutes: 60 }),
        createActivity({ id: 'test-2', startTime: '14:00', durationMinutes: 60 }),
      ];

      expect(getMealSlotPosition(mealSlot, activities)).toBe(-1);
    });

    it('returns correct index when meal is between activities', () => {
      const mealSlot: MealSlot = {
        meal: 'lunch',
        suggestedTime: '12:30',
        showOptions: true,
      };

      const activities = [
        createActivity({ startTime: '09:00', durationMinutes: 120 }),
        createActivity({ id: 'test-2', startTime: '14:00', durationMinutes: 60 }),
      ];

      // First activity ends at 11:00, lunch at 12:30 should be after first activity
      expect(getMealSlotPosition(mealSlot, activities)).toBe(0);
    });

    it('returns last index when meal is after all activities', () => {
      const mealSlot: MealSlot = {
        meal: 'dinner',
        suggestedTime: '19:00',
        showOptions: true,
      };

      const activities = [
        createActivity({ startTime: '09:00', durationMinutes: 60 }),
        createActivity({ id: 'test-2', startTime: '14:00', durationMinutes: 60 }),
      ];

      expect(getMealSlotPosition(mealSlot, activities)).toBe(1);
    });

    it('handles activities without duration', () => {
      const mealSlot: MealSlot = {
        meal: 'lunch',
        suggestedTime: '12:30',
        showOptions: true,
      };

      const activities = [
        createActivity({ startTime: '09:00', durationMinutes: null }),
        createActivity({ id: 'test-2', startTime: '14:00', durationMinutes: null }),
      ];

      // Activity without duration uses start time as end time
      // 12:30 > 09:00 and 12:30 < 14:00
      expect(getMealSlotPosition(mealSlot, activities)).toBe(0);
    });

    it('sorts activities by start time', () => {
      const mealSlot: MealSlot = {
        meal: 'lunch',
        suggestedTime: '12:30',
        showOptions: true,
      };

      // Activities in wrong order
      const activities = [
        createActivity({ startTime: '14:00', durationMinutes: 60 }),
        createActivity({ id: 'test-2', startTime: '09:00', durationMinutes: 60 }),
      ];

      // Should still find correct position
      expect(getMealSlotPosition(mealSlot, activities)).toBe(0);
    });
  });
});
