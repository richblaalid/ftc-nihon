import Dexie, { type Table } from 'dexie';
import type {
  Activity,
  TransitSegment,
  Accommodation,
  Restaurant,
  Alert,
  LocationShare,
  AiCache,
  ChecklistItem,
  SyncMeta,
} from '@/types/database';

/**
 * FTC: Nihon IndexedDB Database
 *
 * Offline-first data layer using Dexie.js
 * This is the PRIMARY data source - Supabase is the sync layer
 */
export class FTCDatabase extends Dexie {
  activities!: Table<Activity, string>;
  transitSegments!: Table<TransitSegment, string>;
  accommodations!: Table<Accommodation, string>;
  restaurants!: Table<Restaurant, string>;
  alerts!: Table<Alert, string>;
  locationShares!: Table<LocationShare, string>;
  aiCache!: Table<AiCache, string>;
  checklistItems!: Table<ChecklistItem, string>;
  syncMeta!: Table<SyncMeta, string>;

  constructor() {
    super('ftc-nihon');

    this.version(1).stores({
      // Activities - main itinerary
      // Primary key: id, Indexes: dayNumber, date, sortOrder compound
      activities: 'id, dayNumber, date, [dayNumber+sortOrder]',

      // Transit segments - pre-calculated directions
      // Primary key: id, Index: activityId for joins
      transitSegments: 'id, activityId',

      // Accommodations - hotel info
      // Primary key: id, Index: sortOrder, date range
      accommodations: 'id, sortOrder, startDate, endDate',

      // Restaurants - meal recommendations
      // Primary key: id, Indexes: dayNumber, city, meal
      restaurants: 'id, dayNumber, city, meal',

      // Alerts - admin announcements
      // Primary key: id, Indexes: active, type
      alerts: 'id, active, type',

      // Location shares - group coordination
      // Primary key: id, Index: userName
      locationShares: 'id, userName',

      // AI cache - pre-generated responses
      // Primary key: id, Indexes: contextType, contextKey
      aiCache: 'id, contextType, contextKey, questionPattern',

      // Checklist items - pre-trip and during trip
      // Primary key: id, Indexes: dueDate, isPreTrip, isCompleted
      checklistItems: 'id, dueDate, isPreTrip, isCompleted, sortOrder',

      // Sync metadata - track last sync times
      // Primary key: id, Index: tableName (unique per table)
      syncMeta: 'id, &tableName',
    });
  }

  /**
   * Get activities for a specific day, ordered by sort order
   */
  async getActivitiesByDay(dayNumber: number): Promise<Activity[]> {
    return this.activities.where('dayNumber').equals(dayNumber).sortBy('sortOrder');
  }

  /**
   * Get activity with its transit segment
   */
  async getActivityWithTransit(activityId: string): Promise<Activity & { transit?: TransitSegment }> {
    const activity = await this.activities.get(activityId);
    if (!activity) throw new Error(`Activity ${activityId} not found`);

    const transit = await this.transitSegments.where('activityId').equals(activityId).first();

    return { ...activity, transit: transit ?? undefined };
  }

  /**
   * Get current accommodation based on date
   */
  async getCurrentAccommodation(date: string): Promise<Accommodation | undefined> {
    return this.accommodations
      .filter((acc) => acc.startDate <= date && acc.endDate >= date)
      .first();
  }

  /**
   * Get active alerts (not expired)
   */
  async getActiveAlerts(): Promise<Alert[]> {
    const now = new Date().toISOString();
    return this.alerts
      .where('active')
      .equals(1) // Dexie stores booleans as 1/0 in indexes
      .filter((alert) => !alert.expiresAt || alert.expiresAt > now)
      .toArray();
  }

  /**
   * Get last sync time for a table
   */
  async getLastSyncTime(tableName: string): Promise<string | null> {
    const meta = await this.syncMeta.where('tableName').equals(tableName).first();
    return meta?.lastSyncedAt ?? null;
  }

  /**
   * Update last sync time for a table
   */
  async updateSyncTime(tableName: string): Promise<void> {
    const now = new Date().toISOString();
    await this.syncMeta.put({
      id: `sync-${tableName}`,
      tableName,
      lastSyncedAt: now,
    });
  }

  /**
   * Clear all data (for testing or full resync)
   */
  async clearAllData(): Promise<void> {
    await this.transaction(
      'rw',
      [
        this.activities,
        this.transitSegments,
        this.accommodations,
        this.restaurants,
        this.alerts,
        this.locationShares,
        this.aiCache,
        this.checklistItems,
        this.syncMeta,
      ],
      async () => {
        await this.activities.clear();
        await this.transitSegments.clear();
        await this.accommodations.clear();
        await this.restaurants.clear();
        await this.alerts.clear();
        await this.locationShares.clear();
        await this.aiCache.clear();
        await this.checklistItems.clear();
        await this.syncMeta.clear();
      }
    );
  }
}

// Singleton instance
export const db = new FTCDatabase();
