import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useSyncStore, formatLastSyncTime } from './sync-store';

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

describe('sync-store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useSyncStore.setState({
      isOnline: true,
      syncVersion: 0,
    });
    localStorageMock.clear();
  });

  describe('initial state', () => {
    it('has correct initial values', () => {
      const state = useSyncStore.getState();

      expect(state.isOnline).toBe(true);
      expect(state.syncVersion).toBe(0);
    });
  });

  describe('setIsOnline', () => {
    it('updates online state', () => {
      const { setIsOnline } = useSyncStore.getState();

      setIsOnline(false);
      expect(useSyncStore.getState().isOnline).toBe(false);

      setIsOnline(true);
      expect(useSyncStore.getState().isOnline).toBe(true);
    });
  });

  describe('incrementSyncVersion', () => {
    it('increments sync version', () => {
      const { incrementSyncVersion } = useSyncStore.getState();

      expect(useSyncStore.getState().syncVersion).toBe(0);

      incrementSyncVersion();
      expect(useSyncStore.getState().syncVersion).toBe(1);

      incrementSyncVersion();
      expect(useSyncStore.getState().syncVersion).toBe(2);
    });
  });
});

describe('formatLastSyncTime', () => {
  const fixedNow = new Date('2026-03-10T12:00:00Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedNow);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "Never" for null timestamp', () => {
    expect(formatLastSyncTime(null)).toBe('Never');
  });

  it('returns "Just now" for recent sync', () => {
    const recentTime = new Date(fixedNow.getTime() - 30000).toISOString(); // 30 seconds ago
    expect(formatLastSyncTime(recentTime)).toBe('Just now');
  });

  it('returns minutes ago for sync within an hour', () => {
    const tenMinutesAgo = new Date(fixedNow.getTime() - 10 * 60 * 1000).toISOString();
    expect(formatLastSyncTime(tenMinutesAgo)).toBe('10m ago');
  });

  it('returns hours ago for sync within a day', () => {
    const fiveHoursAgo = new Date(fixedNow.getTime() - 5 * 60 * 60 * 1000).toISOString();
    expect(formatLastSyncTime(fiveHoursAgo)).toBe('5h ago');
  });

  it('returns days ago for older sync', () => {
    const threeDaysAgo = new Date(fixedNow.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatLastSyncTime(threeDaysAgo)).toBe('3d ago');
  });
});
