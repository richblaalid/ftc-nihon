'use client';

/**
 * NotificationScheduler Component
 *
 * Renders nothing visually but manages push notification scheduling
 * for morning briefings, departure reminders, and deadline alerts.
 * Must be mounted within the app after database initialization.
 */

import { useNotificationScheduler } from '@/lib/hooks/useNotificationScheduler';

export function NotificationScheduler() {
  // Hook handles all scheduling logic internally
  useNotificationScheduler();

  // This component renders nothing - it just runs the scheduler
  return null;
}
