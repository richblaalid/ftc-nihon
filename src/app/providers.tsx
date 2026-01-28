'use client';

import { useEffect, useRef } from 'react';
import { initializeSync, subscribeToChanges } from '@/lib/sync';
import { useSyncStore, initOnlineListeners } from '@/stores/sync-store';
import { seedDatabase, reseedDatabase } from '@/db/seed';
import { warmAllCaches } from '@/lib/cache-warmer';

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * App-level providers for sync, state management, etc.
 */
export function Providers({ children }: ProvidersProps) {
  const initialized = useRef(false);
  const setIsSyncing = useSyncStore((state) => state.setIsSyncing);
  const setLastSyncedAt = useSyncStore((state) => state.setLastSyncedAt);
  const setLastError = useSyncStore((state) => state.setLastError);

  useEffect(() => {
    // Prevent double initialization in React Strict Mode
    if (initialized.current) return;
    initialized.current = true;

    // Initialize online/offline listeners
    const cleanupOnlineListeners = initOnlineListeners();

    // Expose reseed function for development
    if (typeof window !== 'undefined') {
      (window as unknown as { reseedDatabase: typeof reseedDatabase }).reseedDatabase = reseedDatabase;
      console.log('[Dev] Call window.reseedDatabase() to force reseed');
    }

    // Seed database with trip data if empty (development/first load)
    const seedIfNeeded = async () => {
      try {
        const result = await seedDatabase();
        if (result.success) {
          console.log('[Providers] Seed check:', result.message);
        } else {
          console.warn('[Providers] Seed failed:', result.message);
        }
      } catch (error) {
        console.error('[Providers] Seed error:', error);
      }
    };

    // Initialize sync
    const runSync = async () => {
      // First seed the database if needed
      await seedIfNeeded();

      setIsSyncing(true);
      try {
        const result = await initializeSync();

        if (result.success) {
          setLastSyncedAt(new Date().toISOString());
          if (result.didSync) {
            console.log('[Providers] Initial sync complete');
          } else {
            console.log('[Providers] Using cached data, real-time active');
          }
        } else if (result.error) {
          setLastError(result.error);
          console.warn('[Providers] Sync failed:', result.error);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        setLastError(message);
        console.error('[Providers] Sync error:', error);
      } finally {
        setIsSyncing(false);
      }

      // Warm caches in background after sync (with delay to not block UI)
      setTimeout(() => {
        warmAllCaches().catch((err) => {
          console.warn('[Providers] Cache warming failed:', err);
        });
      }, 2000);
    };

    runSync();

    // Cleanup function
    return () => {
      cleanupOnlineListeners();
    };
  }, [setIsSyncing, setLastSyncedAt, setLastError]);

  // Re-sync when coming back online
  useEffect(() => {
    const unsubscribe = useSyncStore.subscribe((state, prevState) => {
      // When going from offline to online, trigger resync
      if (!prevState.isOnline && state.isOnline) {
        console.log('[Providers] Back online, re-establishing sync');
        subscribeToChanges();
      }
    });

    return unsubscribe;
  }, []);

  return <>{children}</>;
}
