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
  Flight,
  Ticket,
  TripInfo,
  DayInfo,
  Attraction,
  ShoppingLocation,
  Phrase,
  TransportRoute,
  MealSelection,
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
  // Enriched data tables (v2)
  flights!: Table<Flight, string>;
  tickets!: Table<Ticket, string>;
  tripInfo!: Table<TripInfo, string>;
  dayInfo!: Table<DayInfo, string>;
  attractions!: Table<Attraction, string>;
  shoppingLocations!: Table<ShoppingLocation, string>;
  phrases!: Table<Phrase, string>;
  transportRoutes!: Table<TransportRoute, string>;
  // User selections (v3)
  mealSelections!: Table<MealSelection, string>;

  constructor() {
    super('ftc-nihon');

    this.version(3).stores({
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

      // =====================================================
      // Enriched data tables (v2)
      // =====================================================

      // Flights - outbound and return
      // Primary key: id, Index: type
      flights: 'id, type',

      // Tickets - attraction reservations
      // Primary key: id, Indexes: date, status, sortOrder
      tickets: 'id, date, status, sortOrder',

      // Trip info - guide and emergency contacts (singleton)
      // Primary key: id
      tripInfo: 'id',

      // Day info - metadata per day
      // Primary key: id, Index: dayNumber
      dayInfo: 'id, dayNumber',

      // Attractions - detailed attraction database
      // Primary key: id, Indexes: city, category
      attractions: 'id, city, category',

      // Shopping locations
      // Primary key: id, Indexes: city, category
      shoppingLocations: 'id, city, category',

      // Japanese phrases
      // Primary key: id, Indexes: category, sortOrder
      phrases: 'id, category, sortOrder',

      // Transport routes
      // Primary key: id
      transportRoutes: 'id',

      // =====================================================
      // User selections (v3)
      // =====================================================

      // Meal selections - user's restaurant choices per day/meal
      // Primary key: id (format: "dayNumber-meal"), Indexes: dayNumber, restaurantId
      mealSelections: 'id, dayNumber, restaurantId, [dayNumber+meal]',
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
        this.flights,
        this.tickets,
        this.tripInfo,
        this.dayInfo,
        this.attractions,
        this.shoppingLocations,
        this.phrases,
        this.transportRoutes,
        this.mealSelections,
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
        await this.flights.clear();
        await this.tickets.clear();
        await this.tripInfo.clear();
        await this.dayInfo.clear();
        await this.attractions.clear();
        await this.shoppingLocations.clear();
        await this.phrases.clear();
        await this.transportRoutes.clear();
        await this.mealSelections.clear();
      }
    );
  }
}

// Singleton instance
export const db = new FTCDatabase();
