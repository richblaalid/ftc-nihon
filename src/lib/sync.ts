import { db } from '@/db/database';
import {
  getSupabaseClient,
  isSupabaseConfigured,
  checkSupabaseConnection,
} from './supabase';
import { fetchAllData } from './supabase-queries';
import type { SyncableTable } from '@/db/types';
import type {
  Activity,
  TransitSegment,
  Accommodation,
  Restaurant,
  Alert,
  ChecklistItem,
} from '@/types/database';
import type { RealtimeChannel } from '@supabase/supabase-js';

// Store active subscriptions for cleanup
let activeChannel: RealtimeChannel | null = null;

/**
 * Convert Supabase snake_case to camelCase
 */
function snakeToCamel<T>(obj: Record<string, unknown>): T {
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
    result[camelKey] = obj[key];
  }
  return result as T;
}

/**
 * Download all data from Supabase and store in IndexedDB
 * Used for initial sync and full refresh
 */
export async function downloadAllData(): Promise<{
  success: boolean;
  tablesUpdated: SyncableTable[];
  error?: string;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      tablesUpdated: [],
      error: 'Supabase not configured',
    };
  }

  const isOnline = await checkSupabaseConnection();
  if (!isOnline) {
    return {
      success: false,
      tablesUpdated: [],
      error: 'Unable to connect to Supabase',
    };
  }

  try {
    console.log('[Sync] Starting full data download...');
    const data = await fetchAllData();

    // Use a transaction to update all tables atomically
    await db.transaction(
      'rw',
      [
        db.activities,
        db.transitSegments,
        db.accommodations,
        db.restaurants,
        db.alerts,
        db.locationShares,
        db.aiCache,
        db.checklistItems,
        db.syncMeta,
      ],
      async () => {
        // Clear and repopulate each table
        await db.activities.clear();
        await db.activities.bulkPut(data.activities);

        await db.transitSegments.clear();
        await db.transitSegments.bulkPut(data.transitSegments);

        await db.accommodations.clear();
        await db.accommodations.bulkPut(data.accommodations);

        await db.restaurants.clear();
        await db.restaurants.bulkPut(data.restaurants);

        await db.alerts.clear();
        await db.alerts.bulkPut(data.alerts);

        await db.locationShares.clear();
        await db.locationShares.bulkPut(data.locationShares);

        await db.aiCache.clear();
        await db.aiCache.bulkPut(data.aiCache);

        await db.checklistItems.clear();
        await db.checklistItems.bulkPut(data.checklistItems);
      }
    );

    // Update sync metadata for all tables
    const tables: SyncableTable[] = [
      'activities',
      'transitSegments',
      'accommodations',
      'restaurants',
      'alerts',
      'locationShares',
      'aiCache',
      'checklistItems',
    ];

    for (const table of tables) {
      await db.updateSyncTime(table);
    }

    console.log('[Sync] Full data download complete', {
      activities: data.activities.length,
      transitSegments: data.transitSegments.length,
      accommodations: data.accommodations.length,
      restaurants: data.restaurants.length,
      alerts: data.alerts.length,
      locationShares: data.locationShares.length,
      aiCache: data.aiCache.length,
      checklistItems: data.checklistItems.length,
    });

    return {
      success: true,
      tablesUpdated: tables,
    };
  } catch (error) {
    console.error('[Sync] Download failed:', error);
    return {
      success: false,
      tablesUpdated: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if we need to sync based on last sync time
 * Returns true if last sync was more than 5 minutes ago
 */
export async function needsSync(): Promise<boolean> {
  const lastSync = await db.getLastSyncTime('activities');
  if (!lastSync) return true;

  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  return lastSync < fiveMinutesAgo;
}

/**
 * Subscribe to real-time changes from Supabase
 * Updates IndexedDB when changes occur
 */
export function subscribeToChanges(): () => void {
  if (!isSupabaseConfigured()) {
    console.warn('[Sync] Supabase not configured, skipping real-time subscription');
    return () => {};
  }

  // Clean up existing subscription
  if (activeChannel) {
    activeChannel.unsubscribe();
    activeChannel = null;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    console.warn('[Sync] Supabase client not available');
    return () => {};
  }

  const channel = supabase.channel('db-changes');

  // Subscribe to activities changes
  channel.on<Activity>(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'activities' },
    async (payload) => {
      console.log('[Sync] Activity change:', payload.eventType);
      const record = snakeToCamel<Activity>(payload.new as Record<string, unknown>);

      if (payload.eventType === 'DELETE') {
        await db.activities.delete((payload.old as { id: string }).id);
      } else {
        await db.activities.put(record);
      }
      await db.updateSyncTime('activities');
    }
  );

  // Subscribe to transit_segments changes
  channel.on<TransitSegment>(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'transit_segments' },
    async (payload) => {
      console.log('[Sync] Transit segment change:', payload.eventType);
      const record = snakeToCamel<TransitSegment>(payload.new as Record<string, unknown>);

      if (payload.eventType === 'DELETE') {
        await db.transitSegments.delete((payload.old as { id: string }).id);
      } else {
        await db.transitSegments.put(record);
      }
      await db.updateSyncTime('transitSegments');
    }
  );

  // Subscribe to alerts changes
  channel.on<Alert>(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'alerts' },
    async (payload) => {
      console.log('[Sync] Alert change:', payload.eventType);
      const record = snakeToCamel<Alert>(payload.new as Record<string, unknown>);

      if (payload.eventType === 'DELETE') {
        await db.alerts.delete((payload.old as { id: string }).id);
      } else {
        await db.alerts.put(record);
      }
      await db.updateSyncTime('alerts');
    }
  );

  // Subscribe to checklist_items changes
  channel.on<ChecklistItem>(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'checklist_items' },
    async (payload) => {
      console.log('[Sync] Checklist item change:', payload.eventType);
      const record = snakeToCamel<ChecklistItem>(payload.new as Record<string, unknown>);

      if (payload.eventType === 'DELETE') {
        await db.checklistItems.delete((payload.old as { id: string }).id);
      } else {
        await db.checklistItems.put(record);
      }
      await db.updateSyncTime('checklistItems');
    }
  );

  // Subscribe to accommodations changes
  channel.on<Accommodation>(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'accommodations' },
    async (payload) => {
      console.log('[Sync] Accommodation change:', payload.eventType);
      const record = snakeToCamel<Accommodation>(payload.new as Record<string, unknown>);

      if (payload.eventType === 'DELETE') {
        await db.accommodations.delete((payload.old as { id: string }).id);
      } else {
        await db.accommodations.put(record);
      }
      await db.updateSyncTime('accommodations');
    }
  );

  // Subscribe to restaurants changes
  channel.on<Restaurant>(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'restaurants' },
    async (payload) => {
      console.log('[Sync] Restaurant change:', payload.eventType);
      const record = snakeToCamel<Restaurant>(payload.new as Record<string, unknown>);

      if (payload.eventType === 'DELETE') {
        await db.restaurants.delete((payload.old as { id: string }).id);
      } else {
        await db.restaurants.put(record);
      }
      await db.updateSyncTime('restaurants');
    }
  );

  // Start the subscription
  channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      console.log('[Sync] Real-time subscription active');
    } else if (status === 'CHANNEL_ERROR') {
      console.error('[Sync] Real-time subscription error');
    } else if (status === 'TIMED_OUT') {
      console.warn('[Sync] Real-time subscription timed out');
    } else if (status === 'CLOSED') {
      console.log('[Sync] Real-time subscription closed');
    }
  });

  activeChannel = channel;

  // Return cleanup function
  return () => {
    if (activeChannel) {
      activeChannel.unsubscribe();
      activeChannel = null;
      console.log('[Sync] Real-time subscription cleaned up');
    }
  };
}

/**
 * Initialize sync on app load
 * - Downloads data if needed
 * - Sets up real-time subscriptions
 */
export async function initializeSync(): Promise<{
  success: boolean;
  didSync: boolean;
  error?: string;
}> {
  const shouldSync = await needsSync();

  if (shouldSync) {
    const result = await downloadAllData();
    if (!result.success) {
      // If sync fails, still try to use cached data
      console.warn('[Sync] Initial sync failed, using cached data');
    }

    // Set up real-time regardless of initial sync success
    subscribeToChanges();

    return {
      success: result.success,
      didSync: true,
      error: result.error,
    };
  }

  // Data is fresh, just set up real-time
  subscribeToChanges();

  return {
    success: true,
    didSync: false,
  };
}

/**
 * Force a full resync
 */
export async function forceResync(): Promise<{
  success: boolean;
  error?: string;
}> {
  const result = await downloadAllData();
  return {
    success: result.success,
    error: result.error,
  };
}
