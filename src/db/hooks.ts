import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './database';
import { useSyncStore } from '@/stores/sync-store';
import type {
  Activity,
  ActivityWithTransit,
  Accommodation,
  Alert,
  Restaurant,
  ChecklistItem,
  Flight,
  FlightType,
  Ticket,
  TripInfo,
  DayInfo,
  Attraction,
  ShoppingLocation,
  Phrase,
  TransportRoute,
  MealType,
  MealAssignment,
  MealSelection,
  ChatMessage,
} from '@/types/database';
import { TRIP_START_DATE } from '@/types/database';
import { getCurrentDate } from '@/lib/utils';

/**
 * Hook to get the current sync version.
 * Include this in useLiveQuery dependencies to force re-query after sync.
 */
export function useSyncVersion(): number {
  return useSyncStore((state) => state.syncVersion);
}

/**
 * Get activities for a specific day, with optional transit data
 */
export function useActivities(dayNumber?: number): Activity[] | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(async () => {
    if (dayNumber !== undefined) {
      return db.activities.where('dayNumber').equals(dayNumber).sortBy('sortOrder');
    }
    return db.activities.orderBy('[dayNumber+sortOrder]').toArray();
  }, [dayNumber, syncVersion]);
}

/**
 * Get activities with their transit segments for a specific day
 */
export function useActivitiesWithTransit(dayNumber: number): ActivityWithTransit[] | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(async () => {
    const activities = await db.activities
      .where('dayNumber')
      .equals(dayNumber)
      .sortBy('sortOrder');

    const transitSegments = await db.transitSegments.toArray();
    const transitMap = new Map(transitSegments.map((t) => [t.activityId, t]));

    return activities.map((activity) => ({
      ...activity,
      transit: transitMap.get(activity.id) ?? null,
    }));
  }, [dayNumber, syncVersion]);
}

/**
 * Get all accommodations
 */
export function useAccommodations(): Accommodation[] | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(() => db.accommodations.orderBy('sortOrder').toArray(), [syncVersion]);
}

/**
 * Get current accommodation based on date
 */
export function useCurrentAccommodation(date?: string): Accommodation | undefined {
  const syncVersion = useSyncVersion();
  const targetDate = date ?? getCurrentDate().toISOString().split('T')[0] ?? '';

  return useLiveQuery(
    () =>
      db.accommodations
        .filter((acc) => targetDate !== '' && acc.startDate <= targetDate && acc.endDate >= targetDate)
        .first(),
    [targetDate, syncVersion]
  );
}

/**
 * Get the current activity based on current time
 * Returns the activity that is currently happening or should be happening now
 */
export function useCurrentActivity(): Activity | null | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(async () => {
    const now = getCurrentDate();
    const today = now.toISOString().split('T')[0] ?? '';
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM

    if (!today) return null;

    // Get today's activities
    const todayActivities = await db.activities.where('date').equals(today).sortBy('sortOrder');

    if (todayActivities.length === 0) return null;

    // Find the current activity
    // An activity is "current" if:
    // 1. It has started (startTime <= currentTime)
    // 2. It hasn't ended yet (based on duration or next activity start)

    for (let i = 0; i < todayActivities.length; i++) {
      const activity = todayActivities[i];
      if (!activity) continue;

      const startTime = activity.startTime;

      // Determine end time
      let endTime: string;
      if (activity.durationMinutes) {
        // Calculate end time from duration
        const [hours, minutes] = startTime.split(':').map(Number);
        if (hours === undefined || minutes === undefined) continue;

        const endDate = new Date();
        endDate.setHours(hours, minutes + activity.durationMinutes, 0, 0);
        endTime = endDate.toTimeString().slice(0, 5);
      } else {
        // Use next activity's start time
        const nextActivity = todayActivities[i + 1];
        endTime = nextActivity?.startTime ?? '23:59';
      }

      if (startTime <= currentTime && currentTime < endTime) {
        return activity;
      }
    }

    // If we're before the first activity, return null
    // If we're after all activities, return the last one
    const firstActivity = todayActivities[0];
    if (firstActivity && currentTime < firstActivity.startTime) {
      return null;
    }

    return todayActivities[todayActivities.length - 1] ?? null;
  }, [syncVersion]);
}

/**
 * Get the next upcoming activity
 */
export function useNextActivity(): Activity | null | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(async () => {
    const now = getCurrentDate();
    const today = now.toISOString().split('T')[0] ?? '';
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM

    if (!today) return null;

    // First try to find next activity today
    const todayActivities = await db.activities.where('date').equals(today).sortBy('sortOrder');

    for (const activity of todayActivities) {
      if (activity.startTime > currentTime) {
        return activity;
      }
    }

    // If no more activities today, get first activity of tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0] ?? '';

    if (!tomorrowStr) return null;

    const tomorrowActivities = await db.activities
      .where('date')
      .equals(tomorrowStr)
      .sortBy('sortOrder');

    return tomorrowActivities[0] ?? null;
  }, [syncVersion]);
}

/**
 * Get the next activity with its transit segment
 * Falls back to first upcoming activity if outside trip dates
 */
export function useNextActivityWithTransit(): ActivityWithTransit | null | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(async () => {
    const now = getCurrentDate();
    const today = now.toISOString().split('T')[0] ?? '';
    const currentTime = now.toTimeString().slice(0, 5);

    if (!today) return null;

    let nextActivity: Activity | null = null;

    // Try to find next activity today
    const todayActivities = await db.activities.where('date').equals(today).sortBy('sortOrder');

    for (const activity of todayActivities) {
      if (activity.startTime > currentTime) {
        nextActivity = activity;
        break;
      }
    }

    // If nothing today, try tomorrow
    if (!nextActivity) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0] ?? '';

      if (tomorrowStr) {
        const tomorrowActivities = await db.activities
          .where('date')
          .equals(tomorrowStr)
          .sortBy('sortOrder');

        nextActivity = tomorrowActivities[0] ?? null;
      }
    }

    // Fallback: get first future activity (useful when outside trip dates)
    if (!nextActivity) {
      const allActivities = await db.activities.orderBy('date').toArray();

      // Find first activity that's in the future
      for (const activity of allActivities) {
        if (activity.date > today || (activity.date === today && activity.startTime > currentTime)) {
          nextActivity = activity;
          break;
        }
      }

      // If still nothing (we're past the trip), show the first activity
      if (!nextActivity && allActivities.length > 0) {
        nextActivity = allActivities[0] ?? null;
      }
    }

    if (!nextActivity) return null;

    // Get transit segment
    const transit = await db.transitSegments.where('activityId').equals(nextActivity.id).first();

    return { ...nextActivity, transit: transit ?? null };
  }, [syncVersion]);
}

/**
 * Get active alerts (not expired, marked active)
 */
export function useAlerts(): Alert[] | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(async () => {
    const now = getCurrentDate().toISOString();

    const alerts = await db.alerts.where('active').equals(1).toArray();

    // Filter out expired alerts
    return alerts.filter((alert) => !alert.expiresAt || alert.expiresAt > now);
  }, [syncVersion]);
}

/**
 * Get urgent alerts and hard deadlines within specified hours
 */
export function useUrgentAlerts(withinHours: number = 2): Alert[] | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(async () => {
    const now = getCurrentDate();
    const threshold = new Date(now.getTime() + withinHours * 60 * 60 * 1000).toISOString();

    const alerts = await db.alerts.where('active').equals(1).toArray();

    return alerts.filter((alert) => {
      // Always include urgent type
      if (alert.type === 'urgent') return true;

      // Include if it has an expiry within the threshold
      if (alert.expiresAt && alert.expiresAt <= threshold && alert.expiresAt > now.toISOString()) {
        return true;
      }

      return false;
    });
  }, [withinHours, syncVersion]);
}

/**
 * Get restaurants for a specific day
 */
export function useRestaurants(dayNumber?: number): Restaurant[] | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(async () => {
    if (dayNumber !== undefined) {
      return db.restaurants.where('dayNumber').equals(dayNumber).toArray();
    }
    return db.restaurants.toArray();
  }, [dayNumber, syncVersion]);
}

/**
 * Get checklist items
 */
export function useChecklistItems(preTripOnly?: boolean): ChecklistItem[] | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(async () => {
    if (preTripOnly !== undefined) {
      return db.checklistItems.filter((item) => item.isPreTrip === preTripOnly).sortBy('sortOrder');
    }
    return db.checklistItems.orderBy('dueDate').toArray();
  }, [preTripOnly, syncVersion]);
}

/**
 * Get incomplete checklist items
 */
export function useIncompleteChecklist(): ChecklistItem[] | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(
    () =>
      db.checklistItems
        .filter((item) => item.isCompleted === false)
        .sortBy('dueDate'),
    [syncVersion]
  );
}

/**
 * Calculate the current trip day number (0-15)
 * Day 0 = departure from MSP, Day 1 = arrival in Tokyo
 * Returns null if outside trip dates
 */
export function useCurrentDayNumber(): number | null {
  const now = getCurrentDate();
  const today = now.toISOString().split('T')[0];

  if (!today) return null;

  const tripStart = new Date(TRIP_START_DATE);
  const todayDate = new Date(today);

  const diffTime = todayDate.getTime() - tripStart.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Day 0 starts on TRIP_START_DATE (departure day)
  const dayNumber = diffDays;

  if (dayNumber < 0 || dayNumber > 15) return null;

  return dayNumber;
}

/**
 * Get date string for a given day number (timezone-safe)
 * Day 0 = TRIP_START_DATE
 */
function getDateForDay(dayNumber: number): string {
  // Parse TRIP_START_DATE as local date to avoid timezone issues
  const [year, month, day] = TRIP_START_DATE.split('-').map(Number);
  if (!year || !month || !day) return '';

  // Create date in local timezone (noon to avoid DST issues)
  const tripStart = new Date(year, month - 1, day, 12, 0, 0);
  const targetDate = new Date(tripStart);
  targetDate.setDate(tripStart.getDate() + dayNumber);

  // Format as YYYY-MM-DD
  const y = targetDate.getFullYear();
  const m = String(targetDate.getMonth() + 1).padStart(2, '0');
  const d = String(targetDate.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Get accommodations relevant to a specific day
 * Returns: { lastNight, tonight } - the hotel from the night before and tonight's hotel
 */
export function useAccommodationsForDay(dayNumber: number): { lastNight: Accommodation | null; tonight: Accommodation | null } | undefined {
  return useLiveQuery(async () => {
    const todayDate = getDateForDay(dayNumber);
    const yesterdayDate = dayNumber > 1 ? getDateForDay(dayNumber - 1) : '';

    const accommodations = await db.accommodations.toArray();

    // Tonight's hotel: date falls within startDate-endDate
    // Note: endDate is checkout day, so we check if todayDate < endDate (not <=)
    const tonight = accommodations.find(
      (acc) => acc.startDate <= todayDate && todayDate < acc.endDate
    ) ?? null;

    // Last night's hotel: yesterday's date falls within startDate-endDate
    const lastNight = yesterdayDate
      ? accommodations.find(
          (acc) => acc.startDate <= yesterdayDate && yesterdayDate < acc.endDate
        ) ?? null
      : null;

    return { lastNight, tonight };
  }, [dayNumber]);
}

/**
 * Get a single activity by ID
 */
export function useActivity(activityId: string | null): Activity | undefined {
  return useLiveQuery(
    () => (activityId ? db.activities.get(activityId) : undefined),
    [activityId]
  );
}

/**
 * Get a single activity with transit by ID
 */
export function useActivityWithTransit(activityId: string | null): ActivityWithTransit | undefined {
  return useLiveQuery(async () => {
    if (!activityId) return undefined;

    const activity = await db.activities.get(activityId);
    if (!activity) return undefined;

    const transit = await db.transitSegments.where('activityId').equals(activityId).first();

    return { ...activity, transit: transit ?? null };
  }, [activityId]);
}

// ============================================================================
// ENRICHED DATA HOOKS (v2)
// ============================================================================

/**
 * Get trip info (guide contact, emergency numbers)
 * Returns single record or undefined
 */
export function useTripInfo(): TripInfo | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(() => db.tripInfo.toCollection().first(), [syncVersion]);
}

/**
 * Get all flights
 */
export function useFlights(): Flight[] | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(() => db.flights.toArray(), [syncVersion]);
}

/**
 * Get a specific flight by type (outbound or return)
 */
export function useFlight(type: FlightType): Flight | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(() => db.flights.where('type').equals(type).first(), [type, syncVersion]);
}

/**
 * Get all tickets (purchased and unpurchased)
 */
export function useTickets(): Ticket[] | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(() => db.tickets.orderBy('sortOrder').toArray(), [syncVersion]);
}

/**
 * Get a specific ticket by ID
 */
export function useTicket(ticketId: string | null): Ticket | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(
    () => (ticketId ? db.tickets.get(ticketId) : undefined),
    [ticketId, syncVersion]
  );
}

/**
 * Get tickets that need to be purchased (status = 'not_purchased')
 */
export function useUnpurchasedTickets(): Ticket[] | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(
    () => db.tickets.where('status').equals('not_purchased').sortBy('sortOrder'),
    [syncVersion]
  );
}

/**
 * Get day info for a specific day number
 */
export function useDayInfo(dayNumber: number): DayInfo | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(
    () => db.dayInfo.where('dayNumber').equals(dayNumber).first(),
    [dayNumber, syncVersion]
  );
}

/**
 * Get all day info records
 */
export function useAllDayInfo(): DayInfo[] | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(() => db.dayInfo.orderBy('dayNumber').toArray(), [syncVersion]);
}

/**
 * Get attractions, optionally filtered by city
 */
export function useAttractions(city?: string): Attraction[] | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(async () => {
    if (city) {
      return db.attractions.where('city').equals(city).toArray();
    }
    return db.attractions.toArray();
  }, [city, syncVersion]);
}

/**
 * Get a specific attraction by ID
 */
export function useAttraction(attractionId: string | null): Attraction | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(
    () => (attractionId ? db.attractions.get(attractionId) : undefined),
    [attractionId, syncVersion]
  );
}

/**
 * Get all shopping locations
 */
export function useShoppingLocations(): ShoppingLocation[] | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(() => db.shoppingLocations.toArray(), [syncVersion]);
}

/**
 * Get shopping locations by city
 */
export function useShoppingLocationsByCity(city: string): ShoppingLocation[] | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(
    () => db.shoppingLocations.where('city').equals(city).toArray(),
    [city, syncVersion]
  );
}

/**
 * Get all Japanese phrases
 */
export function usePhrases(): Phrase[] | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(() => db.phrases.orderBy('sortOrder').toArray(), [syncVersion]);
}

/**
 * Get phrases by category
 */
export function usePhrasesByCategory(category: string): Phrase[] | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(
    () => db.phrases.where('category').equals(category).sortBy('sortOrder'),
    [category, syncVersion]
  );
}

/**
 * Get all transport routes
 */
export function useTransportRoutes(): TransportRoute[] | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(() => db.transportRoutes.toArray(), [syncVersion]);
}

/**
 * Get restaurants by city
 */
export function useRestaurantsByCity(city: string): Restaurant[] | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(
    () => db.restaurants.where('city').equals(city).toArray(),
    [city, syncVersion]
  );
}

/**
 * Get pre-trip checklist items sorted by due date
 */
export function usePreTripChecklist(): ChecklistItem[] | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(
    () =>
      db.checklistItems
        .filter((item) => item.isPreTrip === true)
        .sortBy('sortOrder'),
    [syncVersion]
  );
}

/**
 * Get critical checklist items (due soon or overdue)
 */
export function useCriticalChecklist(daysAhead: number = 7): ChecklistItem[] | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(async () => {
    const now = getCurrentDate();
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() + daysAhead);
    const cutoffStr = cutoff.toISOString().split('T')[0] ?? '';

    const items = await db.checklistItems
      .filter((item) => item.isCompleted === false)
      .toArray();

    // Filter to items due within the threshold
    return items.filter((item) => {
      if (!item.dueDate) return false;
      return item.dueDate <= cutoffStr;
    }).sort((a, b) => {
      // Sort by date, then by sortOrder
      if (a.dueDate && b.dueDate) {
        const dateCompare = a.dueDate.localeCompare(b.dueDate);
        if (dateCompare !== 0) return dateCompare;
      }
      return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    });
  }, [daysAhead, syncVersion]);
}

// ============================================================================
// RESTAURANT OPTIONS HOOKS (v3)
// ============================================================================

/**
 * Restaurant options for a meal with primary and alternatives
 */
export interface RestaurantOptions {
  primary: Restaurant | null;
  alternatives: Restaurant[];
  isIncluded: boolean; // True if meal is included (e.g., ryokan)
}

/**
 * Get restaurant options for a specific day and meal
 * Returns primary recommendation and alternatives based on assignedMeals
 */
export function useRestaurantOptionsForMeal(
  dayNumber: number,
  meal: MealType
): RestaurantOptions | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(async () => {
    const allRestaurants = await db.restaurants.toArray();

    let primary: Restaurant | null = null;
    const alternatives: Restaurant[] = [];
    let isIncluded = false;

    for (const restaurant of allRestaurants) {
      if (!restaurant.assignedMeals) continue;

      try {
        const assignments: MealAssignment[] = JSON.parse(restaurant.assignedMeals);

        for (const assignment of assignments) {
          if (assignment.day === dayNumber && assignment.meal === meal) {
            if (assignment.priority === 'INCLUDED') {
              primary = restaurant;
              isIncluded = true;
            } else if (assignment.priority === 'primary') {
              primary = restaurant;
            } else {
              alternatives.push(restaurant);
            }
            break; // Only count once per restaurant
          }
        }
      } catch {
        // Skip invalid JSON
        continue;
      }
    }

    return { primary, alternatives, isIncluded };
  }, [dayNumber, meal, syncVersion]);
}

/**
 * Get all restaurant options for a day (all meals)
 */
export function useRestaurantOptionsForDay(
  dayNumber: number
): Map<MealType, RestaurantOptions> | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(async () => {
    const allRestaurants = await db.restaurants.toArray();

    const optionsByMeal = new Map<MealType, RestaurantOptions>();
    const meals: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack', 'afternoon'];

    // Initialize empty options for all meals
    for (const meal of meals) {
      optionsByMeal.set(meal, { primary: null, alternatives: [], isIncluded: false });
    }

    for (const restaurant of allRestaurants) {
      if (!restaurant.assignedMeals) continue;

      try {
        const assignments: MealAssignment[] = JSON.parse(restaurant.assignedMeals);

        for (const assignment of assignments) {
          if (assignment.day !== dayNumber) continue;

          const options = optionsByMeal.get(assignment.meal);
          if (!options) continue;

          if (assignment.priority === 'INCLUDED') {
            options.primary = restaurant;
            options.isIncluded = true;
          } else if (assignment.priority === 'primary') {
            options.primary = restaurant;
          } else {
            options.alternatives.push(restaurant);
          }
        }
      } catch {
        continue;
      }
    }

    return optionsByMeal;
  }, [dayNumber, syncVersion]);
}

/**
 * Get user's meal selection for a specific day and meal
 */
export function useMealSelection(
  dayNumber: number,
  meal: MealType
): MealSelection | null | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(async () => {
    const id = `${dayNumber}-${meal}`;
    const selection = await db.mealSelections.get(id);
    return selection ?? null;
  }, [dayNumber, meal, syncVersion]);
}

/**
 * Get all meal selections for a day
 */
export function useMealSelectionsForDay(
  dayNumber: number
): MealSelection[] | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(
    () => db.mealSelections.where('dayNumber').equals(dayNumber).toArray(),
    [dayNumber, syncVersion]
  );
}

/**
 * Get the selected restaurant for a specific day and meal
 * Returns full restaurant details if a selection exists
 */
export function useSelectedRestaurant(
  dayNumber: number,
  meal: MealType
): Restaurant | null | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(async () => {
    const id = `${dayNumber}-${meal}`;
    const selection = await db.mealSelections.get(id);

    if (!selection) return null;

    const restaurant = await db.restaurants.get(selection.restaurantId);
    return restaurant ?? null;
  }, [dayNumber, meal, syncVersion]);
}

/**
 * Set or update a meal selection
 */
export async function setMealSelection(
  dayNumber: number,
  meal: MealType,
  restaurantId: string
): Promise<void> {
  const now = new Date().toISOString();
  const id = `${dayNumber}-${meal}`;

  const existing = await db.mealSelections.get(id);

  if (existing) {
    await db.mealSelections.update(id, {
      restaurantId,
      selectedAt: now,
      updatedAt: now,
    });
  } else {
    await db.mealSelections.add({
      id,
      dayNumber,
      meal,
      restaurantId,
      selectedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  }
}

/**
 * Clear a meal selection
 */
export async function clearMealSelection(
  dayNumber: number,
  meal: MealType
): Promise<void> {
  const id = `${dayNumber}-${meal}`;
  await db.mealSelections.delete(id);
}

/**
 * Get a restaurant by ID
 */
export function useRestaurant(restaurantId: string | null): Restaurant | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(
    () => (restaurantId ? db.restaurants.get(restaurantId) : undefined),
    [restaurantId, syncVersion]
  );
}

// ============================================================================
// CHAT HISTORY HOOKS (v4)
// ============================================================================

/**
 * Get chat history (most recent 50 messages by default)
 */
export function useChatHistory(limit: number = 50): ChatMessage[] | undefined {
  return useLiveQuery(
    () => db.getChatHistory(limit),
    [limit]
  );
}

/**
 * Add a chat message to history
 */
export async function addChatMessage(
  role: 'user' | 'assistant',
  content: string
): Promise<ChatMessage> {
  const now = new Date().toISOString();
  const message: ChatMessage = {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    role,
    content,
    timestamp: now,
    createdAt: now,
  };

  await db.addChatMessage(message);
  return message;
}

/**
 * Clear all chat history
 */
export async function clearChatHistory(): Promise<void> {
  await db.clearChatHistory();
}
