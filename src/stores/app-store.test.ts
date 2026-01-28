import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAppStore } from './app-store';

// Mock localStorage for testing
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('app-store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAppStore.setState({ selectedDay: null });
    localStorageMock.clear();
  });

  describe('selectedDay', () => {
    it('starts with null selectedDay', () => {
      const state = useAppStore.getState();
      expect(state.selectedDay).toBeNull();
    });

    it('can set selectedDay to a valid day number', () => {
      const { setSelectedDay } = useAppStore.getState();

      setSelectedDay(5);

      expect(useAppStore.getState().selectedDay).toBe(5);
    });

    it('can set selectedDay back to null', () => {
      const { setSelectedDay } = useAppStore.getState();

      setSelectedDay(10);
      expect(useAppStore.getState().selectedDay).toBe(10);

      setSelectedDay(null);
      expect(useAppStore.getState().selectedDay).toBeNull();
    });

    it('can update selectedDay multiple times', () => {
      const { setSelectedDay } = useAppStore.getState();

      setSelectedDay(1);
      expect(useAppStore.getState().selectedDay).toBe(1);

      setSelectedDay(8);
      expect(useAppStore.getState().selectedDay).toBe(8);

      setSelectedDay(15);
      expect(useAppStore.getState().selectedDay).toBe(15);
    });
  });
});
