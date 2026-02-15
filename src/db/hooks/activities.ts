/**
 * Activity-related hooks
 * Provides access to activities and activity-with-transit data
 */

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../database';
import { useSyncVersion } from './sync';
import { getCurrentDate } from '@/lib/utils';
import type { Activity, ActivityWithTransit } from '@/types/database';

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
