import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './database';
import type {
  Activity,
  ActivityWithTransit,
  Accommodation,
  Alert,
  Restaurant,
  ChecklistItem,
} from '@/types/database';
import { TRIP_START_DATE } from '@/types/database';
import { getCurrentDate } from '@/lib/utils';

/**
 * Get activities for a specific day, with optional transit data
 */
export function useActivities(dayNumber?: number): Activity[] | undefined {
  return useLiveQuery(async () => {
    if (dayNumber !== undefined) {
      return db.activities.where('dayNumber').equals(dayNumber).sortBy('sortOrder');
    }
    return db.activities.orderBy('[dayNumber+sortOrder]').toArray();
  }, [dayNumber]);
}

/**
 * Get activities with their transit segments for a specific day
 */
export function useActivitiesWithTransit(dayNumber: number): ActivityWithTransit[] | undefined {
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
  }, [dayNumber]);
}

/**
 * Get all accommodations
 */
export function useAccommodations(): Accommodation[] | undefined {
  return useLiveQuery(() => db.accommodations.orderBy('sortOrder').toArray());
}

/**
 * Get current accommodation based on date
 */
export function useCurrentAccommodation(date?: string): Accommodation | undefined {
  const targetDate = date ?? getCurrentDate().toISOString().split('T')[0] ?? '';

  return useLiveQuery(
    () =>
      db.accommodations
        .filter((acc) => targetDate !== '' && acc.startDate <= targetDate && acc.endDate >= targetDate)
        .first(),
    [targetDate]
  );
}

/**
 * Get the current activity based on current time
 * Returns the activity that is currently happening or should be happening now
 */
export function useCurrentActivity(): Activity | null | undefined {
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
  });
}

/**
 * Get the next upcoming activity
 */
export function useNextActivity(): Activity | null | undefined {
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
  });
}

/**
 * Get the next activity with its transit segment
 */
export function useNextActivityWithTransit(): ActivityWithTransit | null | undefined {
  return useLiveQuery(async () => {
    const now = getCurrentDate();
    const today = now.toISOString().split('T')[0] ?? '';
    const currentTime = now.toTimeString().slice(0, 5);

    if (!today) return null;

    // Get next activity
    const todayActivities = await db.activities.where('date').equals(today).sortBy('sortOrder');

    let nextActivity: Activity | null = null;
    for (const activity of todayActivities) {
      if (activity.startTime > currentTime) {
        nextActivity = activity;
        break;
      }
    }

    if (!nextActivity) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0] ?? '';

      if (!tomorrowStr) return null;

      const tomorrowActivities = await db.activities
        .where('date')
        .equals(tomorrowStr)
        .sortBy('sortOrder');

      nextActivity = tomorrowActivities[0] ?? null;
    }

    if (!nextActivity) return null;

    // Get transit segment
    const transit = await db.transitSegments.where('activityId').equals(nextActivity.id).first();

    return { ...nextActivity, transit: transit ?? null };
  });
}

/**
 * Get active alerts (not expired, marked active)
 */
export function useAlerts(): Alert[] | undefined {
  return useLiveQuery(async () => {
    const now = getCurrentDate().toISOString();

    const alerts = await db.alerts.where('active').equals(1).toArray();

    // Filter out expired alerts
    return alerts.filter((alert) => !alert.expiresAt || alert.expiresAt > now);
  });
}

/**
 * Get urgent alerts and hard deadlines within specified hours
 */
export function useUrgentAlerts(withinHours: number = 2): Alert[] | undefined {
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
  }, [withinHours]);
}

/**
 * Get restaurants for a specific day
 */
export function useRestaurants(dayNumber?: number): Restaurant[] | undefined {
  return useLiveQuery(async () => {
    if (dayNumber !== undefined) {
      return db.restaurants.where('dayNumber').equals(dayNumber).toArray();
    }
    return db.restaurants.toArray();
  }, [dayNumber]);
}

/**
 * Get checklist items
 */
export function useChecklistItems(preTripOnly?: boolean): ChecklistItem[] | undefined {
  return useLiveQuery(async () => {
    if (preTripOnly !== undefined) {
      return db.checklistItems.where('isPreTrip').equals(preTripOnly ? 1 : 0).sortBy('sortOrder');
    }
    return db.checklistItems.orderBy('dueDate').toArray();
  }, [preTripOnly]);
}

/**
 * Get incomplete checklist items
 */
export function useIncompleteChecklist(): ChecklistItem[] | undefined {
  return useLiveQuery(() =>
    db.checklistItems
      .where('isCompleted')
      .equals(0)
      .sortBy('dueDate')
  );
}

/**
 * Calculate the current trip day number (1-15)
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

  // Day 1 starts on TRIP_START_DATE
  const dayNumber = diffDays + 1;

  if (dayNumber < 1 || dayNumber > 15) return null;

  return dayNumber;
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
