/**
 * Sync version hook
 * Used to force re-queries after sync operations
 */

import { useSyncStore } from '@/stores/sync-store';

/**
 * Hook to get the current sync version.
 * Include this in useLiveQuery dependencies to force re-query after sync.
 */
export function useSyncVersion(): number {
  return useSyncStore((state) => state.syncVersion);
}
