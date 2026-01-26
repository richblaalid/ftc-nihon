/**
 * Dexie-specific type definitions
 *
 * Re-exports from @/types/database with any IndexedDB-specific additions
 */

// Re-export all database types
export type {
  Activity,
  ActivityCategory,
  TransitSegment,
  TransitStep,
  Accommodation,
  Restaurant,
  Alert,
  AlertType,
  LocationShare,
  AiCache,
  ChecklistItem,
  MealType,
  SyncMeta,
  ActivityWithTransit,
} from '@/types/database';

export { TRIP_START_DATE, TRIP_END_DATE, TRIP_DAYS, DAY_CITIES } from '@/types/database';

/**
 * Sync status for tracking data freshness
 */
export interface SyncStatus {
  tableName: string;
  lastSyncedAt: Date | null;
  isSyncing: boolean;
  error: string | null;
}

/**
 * Bulk upsert options for sync operations
 */
export interface BulkUpsertOptions {
  /** Clear existing data before insert */
  clearFirst?: boolean;
  /** Update sync metadata after operation */
  updateSyncMeta?: boolean;
}

/**
 * Table names for type-safe sync operations
 */
export type SyncableTable =
  | 'activities'
  | 'transitSegments'
  | 'accommodations'
  | 'restaurants'
  | 'alerts'
  | 'locationShares'
  | 'aiCache'
  | 'checklistItems';

/**
 * Map of Supabase table names to Dexie table names
 * (Supabase uses snake_case, Dexie uses camelCase)
 */
export const TABLE_NAME_MAP: Record<string, SyncableTable> = {
  activities: 'activities',
  transit_segments: 'transitSegments',
  accommodations: 'accommodations',
  restaurants: 'restaurants',
  alerts: 'alerts',
  location_shares: 'locationShares',
  ai_cache: 'aiCache',
  checklist_items: 'checklistItems',
};

/**
 * Reverse map for Supabase queries
 */
export const SUPABASE_TABLE_NAMES: Record<SyncableTable, string> = {
  activities: 'activities',
  transitSegments: 'transit_segments',
  accommodations: 'accommodations',
  restaurants: 'restaurants',
  alerts: 'alerts',
  locationShares: 'location_shares',
  aiCache: 'ai_cache',
  checklistItems: 'checklist_items',
};
