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
      lastSyncedAt: null,
      isSyncing: false,
      isOnline: true,
      pendingChanges: 0,
      lastError: null,
    });
    localStorageMock.clear();
  });

  describe('initial state', () => {
    it('has correct initial values', () => {
      const state = useSyncStore.getState();

      expect(state.lastSyncedAt).toBeNull();
      expect(state.isSyncing).toBe(false);
      expect(state.pendingChanges).toBe(0);
      expect(state.lastError).toBeNull();
    });
  });

  describe('setLastSyncedAt', () => {
    it('updates lastSyncedAt and clears error', () => {
      const { setLastSyncedAt, setLastError } = useSyncStore.getState();

      setLastError('Some error');
      expect(useSyncStore.getState().lastError).toBe('Some error');

      const timestamp = '2026-03-10T12:00:00Z';
      setLastSyncedAt(timestamp);

      const state = useSyncStore.getState();
      expect(state.lastSyncedAt).toBe(timestamp);
      expect(state.lastError).toBeNull();
    });
  });

  describe('setIsSyncing', () => {
    it('toggles syncing state', () => {
      const { setIsSyncing } = useSyncStore.getState();

      setIsSyncing(true);
      expect(useSyncStore.getState().isSyncing).toBe(true);

      setIsSyncing(false);
      expect(useSyncStore.getState().isSyncing).toBe(false);
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

  describe('pendingChanges', () => {
    it('increments pending changes', () => {
      const { incrementPendingChanges } = useSyncStore.getState();

      incrementPendingChanges();
      expect(useSyncStore.getState().pendingChanges).toBe(1);

      incrementPendingChanges();
      expect(useSyncStore.getState().pendingChanges).toBe(2);
    });

    it('decrements pending changes', () => {
      useSyncStore.setState({ pendingChanges: 5 });
      const { decrementPendingChanges } = useSyncStore.getState();

      decrementPendingChanges();
      expect(useSyncStore.getState().pendingChanges).toBe(4);
    });

    it('does not go below zero', () => {
      useSyncStore.setState({ pendingChanges: 1 });
      const { decrementPendingChanges } = useSyncStore.getState();

      decrementPendingChanges();
      expect(useSyncStore.getState().pendingChanges).toBe(0);

      decrementPendingChanges();
      expect(useSyncStore.getState().pendingChanges).toBe(0);
    });

    it('clears all pending changes', () => {
      useSyncStore.setState({ pendingChanges: 10 });
      const { clearPendingChanges } = useSyncStore.getState();

      clearPendingChanges();
      expect(useSyncStore.getState().pendingChanges).toBe(0);
    });
  });

  describe('setLastError', () => {
    it('sets error message', () => {
      const { setLastError } = useSyncStore.getState();

      setLastError('Connection failed');
      expect(useSyncStore.getState().lastError).toBe('Connection failed');
    });

    it('clears error message', () => {
      useSyncStore.setState({ lastError: 'Some error' });
      const { setLastError } = useSyncStore.getState();

      setLastError(null);
      expect(useSyncStore.getState().lastError).toBeNull();
    });
  });

  describe('resetSyncState', () => {
    it('resets all sync-related state', () => {
      // Set various state
      useSyncStore.setState({
        lastSyncedAt: '2026-03-10T12:00:00Z',
        isSyncing: true,
        pendingChanges: 5,
        lastError: 'Some error',
      });

      const { resetSyncState } = useSyncStore.getState();
      resetSyncState();

      const state = useSyncStore.getState();
      expect(state.lastSyncedAt).toBeNull();
      expect(state.isSyncing).toBe(false);
      expect(state.pendingChanges).toBe(0);
      expect(state.lastError).toBeNull();
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
