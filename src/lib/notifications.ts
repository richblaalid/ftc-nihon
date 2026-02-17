/**
 * Notification Scheduling Service
 *
 * Manages scheduled notifications for the FTC: Nihon trip app.
 * Handles morning briefings, departure reminders, and deadline alerts.
 */

import { db } from '@/db/database';

/**
 * Notification types supported by the app
 */
export type NotificationType = 'morning_briefing' | 'departure_reminder' | 'deadline_alert';

/**
 * Scheduled notification record
 */
export interface ScheduledNotification {
  id: string;
  type: NotificationType;
  scheduledFor: string; // ISO datetime
  title: string;
  body: string;
  url?: string;
  activityId?: string;
  dayNumber?: number;
  sent: boolean;
  createdAt: string;
}

/**
 * Notification preferences stored in IndexedDB
 */
export interface NotificationPreferences {
  enabled: boolean;
  morningBriefing: boolean;
  departureReminders: boolean;
  deadlineAlerts: boolean;
  subscriptionJson: string | null; // Serialized PushSubscription
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: false,
  morningBriefing: true,
  departureReminders: true,
  deadlineAlerts: true,
  subscriptionJson: null,
};

const PREFERENCES_KEY = 'notification_preferences';

/**
 * Get notification preferences from localStorage
 */
export function getNotificationPreferences(): NotificationPreferences {
  if (typeof window === 'undefined') {
    return DEFAULT_PREFERENCES;
  }

  try {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    if (stored) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Failed to load notification preferences:', error);
  }

  return DEFAULT_PREFERENCES;
}

/**
 * Save notification preferences to localStorage
 */
export function saveNotificationPreferences(prefs: Partial<NotificationPreferences>): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const current = getNotificationPreferences();
    const updated = { ...current, ...prefs };
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save notification preferences:', error);
  }
}

/**
 * Format time in Japan timezone for notifications
 */
function formatJapanTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Asia/Tokyo',
  });
}

/**
 * Parse time string to today's date in Japan timezone
 */
function parseTimeToJapanDate(timeStr: string, dateStr: string): Date {
  // Create date at the specified time in Japan
  const [hours, minutes] = timeStr.split(':').map(Number);
  const [year, month, day] = dateStr.split('-').map(Number);

  if (hours === undefined || minutes === undefined ||
      year === undefined || month === undefined || day === undefined) {
    return new Date();
  }

  // Create in UTC then adjust for Japan (UTC+9)
  const date = new Date(Date.UTC(year, month - 1, day, hours - 9, minutes));
  return date;
}

/**
 * Generate morning briefing notification content
 */
export async function generateMorningBriefing(dayNumber: number): Promise<{
  title: string;
  body: string;
  url: string;
} | null> {
  try {
    const dayInfo = await db.dayInfo.where('dayNumber').equals(dayNumber).first();
    if (!dayInfo) return null;

    const activities = await db.activities
      .where('dayNumber')
      .equals(dayNumber)
      .sortBy('sortOrder');

    const firstActivity = activities[0];
    const hardDeadlines = activities.filter((a) => a.isHardDeadline);

    let body = `Today: ${dayInfo.title} in ${dayInfo.location}.`;

    if (firstActivity) {
      body += ` First up: ${firstActivity.name} at ${formatJapanTime(
        parseTimeToJapanDate(firstActivity.startTime, dayInfo.date)
      )}.`;
    }

    if (hardDeadlines.length > 0) {
      body += ` ${hardDeadlines.length} timed ${hardDeadlines.length === 1 ? 'entry' : 'entries'} today!`;
    }

    return {
      title: `Day ${dayNumber}: ${dayInfo.title}`,
      body,
      url: '/schedule',
    };
  } catch (error) {
    console.error('Failed to generate morning briefing:', error);
    return null;
  }
}

/**
 * Generate departure reminder notification content
 */
export function generateDepartureReminder(
  activityName: string,
  leaveByTime: string,
  transitSummary?: string
): { title: string; body: string } {
  let body = `Leave now to arrive on time.`;
  if (transitSummary) {
    body = transitSummary;
  }

  return {
    title: `Time to head to ${activityName}`,
    body,
  };
}

/**
 * Generate deadline alert notification content
 */
export function generateDeadlineAlert(
  activityName: string,
  timeUntil: string
): { title: string; body: string } {
  return {
    title: `${activityName} in ${timeUntil}`,
    body: `This activity has a timed entry. Start heading back now!`,
  };
}

/**
 * Schedule a notification by storing it in IndexedDB
 * The actual sending happens via the API route when the time comes
 */
export async function scheduleNotification(
  notification: Omit<ScheduledNotification, 'id' | 'sent' | 'createdAt'>
): Promise<string> {
  const id = `notif_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const record: ScheduledNotification = {
    ...notification,
    id,
    sent: false,
    createdAt: new Date().toISOString(),
  };

  // Store in IndexedDB (we'd need to add this table)
  // For now, we'll use localStorage as a simple alternative
  const stored = getScheduledNotifications();
  stored.push(record);
  saveScheduledNotifications(stored);

  return id;
}

/**
 * Get all scheduled notifications from localStorage
 */
export function getScheduledNotifications(): ScheduledNotification[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = localStorage.getItem('scheduled_notifications');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load scheduled notifications:', error);
  }

  return [];
}

/**
 * Save scheduled notifications to localStorage
 */
function saveScheduledNotifications(notifications: ScheduledNotification[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem('scheduled_notifications', JSON.stringify(notifications));
  } catch (error) {
    console.error('Failed to save scheduled notifications:', error);
  }
}

/**
 * Mark a notification as sent
 */
export function markNotificationSent(id: string): void {
  const notifications = getScheduledNotifications();
  const updated = notifications.map((n) =>
    n.id === id ? { ...n, sent: true } : n
  );
  saveScheduledNotifications(updated);
}

/**
 * Get pending notifications that should be sent
 */
export function getPendingNotifications(): ScheduledNotification[] {
  const now = new Date().toISOString();
  const notifications = getScheduledNotifications();

  return notifications.filter((n) => !n.sent && n.scheduledFor <= now);
}

/**
 * Clear old sent notifications (older than 1 day)
 */
export function cleanupOldNotifications(): void {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const notifications = getScheduledNotifications();

  const filtered = notifications.filter(
    (n) => !n.sent || n.scheduledFor > oneDayAgo
  );

  saveScheduledNotifications(filtered);
}
