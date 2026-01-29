import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SyncState {
  /** Whether the device is currently online */
  isOnline: boolean;
  /** Version counter - used to trigger re-renders (legacy, kept for compatibility) */
  syncVersion: number;

  // Actions
  setIsOnline: (online: boolean) => void;
  /** Increment sync version to trigger UI re-renders */
  incrementSyncVersion: () => void;
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set) => ({
      // Initial state
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      syncVersion: 0,

      // Actions
      setIsOnline: (online) => set({ isOnline: online }),

      incrementSyncVersion: () =>
        set((state) => ({ syncVersion: state.syncVersion + 1 })),
    }),
    {
      name: 'ftc-sync-state',
      storage: createJSONStorage(() => localStorage),
      // Only persist syncVersion
      partialize: (state) => ({
        syncVersion: state.syncVersion,
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
    console.log('[App] Device is online');
  };

  const handleOffline = () => {
    useSyncStore.getState().setIsOnline(false);
    console.log('[App] Device is offline');
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
 * @deprecated Sync functionality removed - kept for backwards compatibility
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
