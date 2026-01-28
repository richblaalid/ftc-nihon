/**
 * Cache Warmer - Prefetches pages for offline access
 *
 * This module proactively caches page routes so they're available offline
 * without requiring the user to visit each page first.
 */

import { db } from '@/db/database';

/**
 * Prefetch a URL to warm the service worker cache
 */
async function prefetchUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'same-origin',
      // Use low priority to avoid blocking user interactions
      priority: 'low',
    } as RequestInit);
    return response.ok;
  } catch {
    console.warn(`[CacheWarmer] Failed to prefetch: ${url}`);
    return false;
  }
}

/**
 * Warm the cache with all activity detail pages
 * Call this after initial data sync to ensure offline access
 */
export async function warmActivityCache(): Promise<{ cached: number; total: number }> {
  try {
    const activities = await db.activities.toArray();
    const activityIds = activities.map((a) => a.id);

    console.log(`[CacheWarmer] Warming cache for ${activityIds.length} activities...`);

    let cached = 0;

    // Prefetch in small batches to avoid overwhelming the browser
    const batchSize = 5;
    for (let i = 0; i < activityIds.length; i += batchSize) {
      const batch = activityIds.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map((id) => prefetchUrl(`/schedule/${id}`))
      );
      cached += results.filter(Boolean).length;

      // Small delay between batches
      if (i + batchSize < activityIds.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    console.log(`[CacheWarmer] Cached ${cached}/${activityIds.length} activity pages`);
    return { cached, total: activityIds.length };
  } catch (error) {
    console.error('[CacheWarmer] Failed to warm activity cache:', error);
    return { cached: 0, total: 0 };
  }
}

/**
 * Warm the cache with static app routes
 */
async function warmStaticRoutes(): Promise<number> {
  const staticRoutes = ['/schedule', '/map', '/reservations'];
  let cached = 0;

  for (const route of staticRoutes) {
    const success = await prefetchUrl(route);
    if (success) cached++;
  }

  console.log(`[CacheWarmer] Cached ${cached}/${staticRoutes.length} static routes`);
  return cached;
}

/**
 * Warm all caches - call this once after initial sync
 */
export async function warmAllCaches(): Promise<void> {
  // Only run if online
  if (!navigator.onLine) {
    console.log('[CacheWarmer] Skipping - device is offline');
    return;
  }

  // Check if we've already warmed caches recently (within 1 hour)
  const lastWarmed = localStorage.getItem('ftc-cache-warmed');
  if (lastWarmed) {
    const hourAgo = Date.now() - 60 * 60 * 1000;
    if (parseInt(lastWarmed, 10) > hourAgo) {
      console.log('[CacheWarmer] Skipping - caches recently warmed');
      return;
    }
  }

  console.log('[CacheWarmer] Starting cache warming...');

  // Warm caches sequentially to avoid overwhelming the network
  await warmStaticRoutes();
  await warmActivityCache();

  // Mark as warmed
  localStorage.setItem('ftc-cache-warmed', Date.now().toString());

  console.log('[CacheWarmer] Cache warming complete');
}
