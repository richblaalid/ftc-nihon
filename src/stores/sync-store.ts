import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SyncState {
  /** Timestamp of last successful sync */
  lastSyncedAt: string | null;
  /** Whether a sync operation is currently in progress */
  isSyncing: boolean;
  /** Whether the device is currently online */
  isOnline: boolean;
  /** Number of pending local changes to sync */
  pendingChanges: number;
  /** Last sync error message */
  lastError: string | null;

  // Actions
  setLastSyncedAt: (timestamp: string) => void;
  setIsSyncing: (syncing: boolean) => void;
  setIsOnline: (online: boolean) => void;
  incrementPendingChanges: () => void;
  decrementPendingChanges: () => void;
  clearPendingChanges: () => void;
  setLastError: (error: string | null) => void;
  resetSyncState: () => void;
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set) => ({
      // Initial state
      lastSyncedAt: null,
      isSyncing: false,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      pendingChanges: 0,
      lastError: null,

      // Actions
      setLastSyncedAt: (timestamp) => set({ lastSyncedAt: timestamp, lastError: null }),

      setIsSyncing: (syncing) => set({ isSyncing: syncing }),

      setIsOnline: (online) => set({ isOnline: online }),

      incrementPendingChanges: () =>
        set((state) => ({ pendingChanges: state.pendingChanges + 1 })),

      decrementPendingChanges: () =>
        set((state) => ({ pendingChanges: Math.max(0, state.pendingChanges - 1) })),

      clearPendingChanges: () => set({ pendingChanges: 0 }),

      setLastError: (error) => set({ lastError: error }),

      resetSyncState: () =>
        set({
          lastSyncedAt: null,
          isSyncing: false,
          pendingChanges: 0,
          lastError: null,
        }),
    }),
    {
      name: 'ftc-sync-state',
      storage: createJSONStorage(() => localStorage),
      // Only persist certain fields
      partialize: (state) => ({
        lastSyncedAt: state.lastSyncedAt,
      }),
    }
  )
);

/**
 * Initialize online/offline listeners
 * Call this once on app startup
 */
export function initOnlineListeners(): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleOnline = () => {
    useSyncStore.getState().setIsOnline(true);
    console.log('[Sync] Device is online');
  };

  const handleOffline = () => {
    useSyncStore.getState().setIsOnline(false);
    console.log('[Sync] Device is offline');
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Set initial state
  useSyncStore.getState().setIsOnline(navigator.onLine);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

/**
 * Helper to format last sync time for display
 */
export function formatLastSyncTime(timestamp: string | null): string {
  if (!timestamp) return 'Never';

  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
