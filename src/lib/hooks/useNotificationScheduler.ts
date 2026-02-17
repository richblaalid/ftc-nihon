'use client';

/**
 * Notification Scheduler Hook
 *
 * Manages scheduling and triggering of push notifications.
 * Handles morning briefings, departure reminders, and deadline alerts.
 */

import { useEffect, useCallback, useRef } from 'react';
import { useCurrentDayNumber, useActivitiesWithTransit, useDayInfo } from '@/db/hooks';
import { getJapanTime } from '@/lib/time-utils';
import {
  getNotificationPreferences,
  generateMorningBriefing,
  generateDepartureReminder,
  generateDeadlineAlert,
} from '@/lib/notifications';
import { isPushSupported, getCurrentSubscription, serializeSubscription } from '@/lib/push';

// Constants for notification timing
const MORNING_BRIEFING_HOUR = 8; // 8:00 AM JST
const DEPARTURE_REMINDER_MINUTES = 30; // 30 min before leave time
const DEADLINE_ALERT_MINUTES = 60; // 60 min before hard deadline

// Keys for tracking sent notifications
const BRIEFING_SENT_KEY = 'morning_briefing_sent';
const DEPARTURE_SENT_PREFIX = 'departure_sent_';
const DEADLINE_SENT_PREFIX = 'deadline_sent_';

/**
 * Check if a notification was already sent today
 */
function wasNotificationSent(key: string, date: string): boolean {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem(key);
  return stored === date;
}

/**
 * Mark a notification as sent
 */
function markNotificationSent(key: string, date: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, date);
}

/**
 * Send a push notification via the API
 */
async function sendNotification(
  title: string,
  body: string,
  url?: string,
  tag?: string
): Promise<boolean> {
  try {
    // Get the current subscription
    const subscription = await getCurrentSubscription();
    if (!subscription) {
      console.log('[Notifications] No subscription, skipping notification');
      return false;
    }

    const serialized = serializeSubscription(subscription);
    if (!serialized) {
      console.error('[Notifications] Failed to serialize subscription');
      return false;
    }

    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: serialized,
        title,
        body,
        url,
        tag,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[Notifications] API error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Notifications] Failed to send notification:', error);
    return false;
  }
}

/**
 * Hook for scheduling and managing notifications
 */
export function useNotificationScheduler() {
  const currentDayNumber = useCurrentDayNumber();
  const activities = useActivitiesWithTransit(currentDayNumber ?? 1);
  const dayInfo = useDayInfo(currentDayNumber ?? 1);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check and send morning briefing
  const checkMorningBriefing = useCallback(async () => {
    const prefs = getNotificationPreferences();
    if (!prefs.enabled || !prefs.morningBriefing) return;
    if (currentDayNumber === null) return;

    const japanTime = getJapanTime(new Date());
    const today = dayInfo?.date ?? new Date().toISOString().split('T')[0]!;

    // Only send between 8:00 AM and 10:00 AM
    if (japanTime.hours < MORNING_BRIEFING_HOUR || japanTime.hours >= 10) return;

    // Check if already sent today
    if (wasNotificationSent(BRIEFING_SENT_KEY, today)) return;

    // Generate and send briefing
    const briefing = await generateMorningBriefing(currentDayNumber);
    if (briefing) {
      const sent = await sendNotification(
        briefing.title,
        briefing.body,
        briefing.url,
        'morning-briefing'
      );
      if (sent) {
        markNotificationSent(BRIEFING_SENT_KEY, today);
        console.log('[Notifications] Morning briefing sent');
      }
    }
  }, [currentDayNumber, dayInfo?.date]);

  // Check and send departure reminders
  const checkDepartureReminders = useCallback(async () => {
    const prefs = getNotificationPreferences();
    if (!prefs.enabled || !prefs.departureReminders) return;
    if (!activities) return;

    const japanTime = getJapanTime(new Date());
    const currentMinutes = japanTime.hours * 60 + japanTime.minutes;
    const today = dayInfo?.date ?? new Date().toISOString().split('T')[0]!;

    for (const activity of activities) {
      if (!activity.transit?.leaveBy) continue;

      const [leaveHours, leaveMinutes] = activity.transit.leaveBy.split(':').map(Number);
      if (leaveHours === undefined || leaveMinutes === undefined) continue;

      const leaveByMinutes = leaveHours * 60 + leaveMinutes;
      const minutesUntilLeave = leaveByMinutes - currentMinutes;

      // Check if we should send (between 30-35 min before)
      if (minutesUntilLeave < DEPARTURE_REMINDER_MINUTES - 5 ||
          minutesUntilLeave > DEPARTURE_REMINDER_MINUTES) continue;

      const key = `${DEPARTURE_SENT_PREFIX}${activity.id}_${today}`;
      if (wasNotificationSent(key, today)) continue;

      const reminder = generateDepartureReminder(
        activity.name,
        activity.transit.leaveBy,
        activity.transit.summary ?? undefined
      );

      const sent = await sendNotification(
        reminder.title,
        reminder.body,
        `/schedule/${activity.id}`,
        `departure-${activity.id}`
      );

      if (sent) {
        markNotificationSent(key, today);
        console.log(`[Notifications] Departure reminder sent for ${activity.name}`);
      }
    }
  }, [activities, dayInfo?.date]);

  // Check and send deadline alerts
  const checkDeadlineAlerts = useCallback(async () => {
    const prefs = getNotificationPreferences();
    if (!prefs.enabled || !prefs.deadlineAlerts) return;
    if (!activities) return;

    const japanTime = getJapanTime(new Date());
    const currentMinutes = japanTime.hours * 60 + japanTime.minutes;
    const today = dayInfo?.date ?? new Date().toISOString().split('T')[0]!;

    for (const activity of activities) {
      if (!activity.isHardDeadline) continue;

      const [actHours, actMinutes] = activity.startTime.split(':').map(Number);
      if (actHours === undefined || actMinutes === undefined) continue;

      const activityMinutes = actHours * 60 + actMinutes;
      const minutesUntil = activityMinutes - currentMinutes;

      // Check if we should send (between 55-65 min before)
      if (minutesUntil < DEADLINE_ALERT_MINUTES - 5 ||
          minutesUntil > DEADLINE_ALERT_MINUTES + 5) continue;

      const key = `${DEADLINE_SENT_PREFIX}${activity.id}_${today}`;
      if (wasNotificationSent(key, today)) continue;

      const alert = generateDeadlineAlert(activity.name, '1 hour');

      const sent = await sendNotification(
        alert.title,
        alert.body,
        `/schedule/${activity.id}`,
        `deadline-${activity.id}`
      );

      if (sent) {
        markNotificationSent(key, today);
        console.log(`[Notifications] Deadline alert sent for ${activity.name}`);
      }
    }
  }, [activities, dayInfo?.date]);

  // Main check function
  const checkNotifications = useCallback(async () => {
    if (!isPushSupported()) return;

    const prefs = getNotificationPreferences();
    if (!prefs.enabled) return;

    await checkMorningBriefing();
    await checkDepartureReminders();
    await checkDeadlineAlerts();
  }, [checkMorningBriefing, checkDepartureReminders, checkDeadlineAlerts]);

  // Set up periodic checking
  useEffect(() => {
    // Check immediately on mount
    checkNotifications();

    // Check every minute
    checkIntervalRef.current = setInterval(checkNotifications, 60 * 1000);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [checkNotifications]);

  return {
    checkNotifications,
  };
}
