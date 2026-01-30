'use client';

import { useEffect, useRef } from 'react';
import { seedDatabase, reseedDatabase, checkDataVersion } from '@/db/seed';
import { warmAllCaches } from '@/lib/cache-warmer';
import { initOnlineListeners } from '@/stores/sync-store';
import { seedAICache } from '@/db/seed-ai-cache';
import { seedTourContent } from '@/db/seed-tour-content';

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * App-level providers for database seeding and cache warming.
 * Note: Supabase sync has been removed - app uses seeded IndexedDB data.
 */
export function Providers({ children }: ProvidersProps) {
  const initialized = useRef(false);

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
    const initialize = async () => {
      try {
        const result = await seedDatabase();
        if (result.success) {
          console.log('[Providers] Seed check:', result.message);
        } else {
          console.warn('[Providers] Seed failed:', result.message);
        }

        // Check if data version changed and update phrases if needed
        await checkDataVersion();
      } catch (error) {
        console.error('[Providers] Seed error:', error);
      }

      // Seed AI cache for offline responses
      try {
        await seedAICache();
        await seedTourContent();
      } catch (error) {
        console.warn('[Providers] AI cache seed failed:', error);
      }

      // Warm caches in background after seeding (with delay to not block UI)
      setTimeout(() => {
        warmAllCaches().catch((err) => {
          console.warn('[Providers] Cache warming failed:', err);
        });
      }, 2000);
    };

    initialize();

    return () => {
      cleanupOnlineListeners();
    };
  }, []);

  return <>{children}</>;
}
