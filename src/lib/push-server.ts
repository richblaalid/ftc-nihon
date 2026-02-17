/**
 * Server-side Web Push Notification Utilities
 *
 * This file should only be imported in server-side code (API routes, server components).
 * Uses the web-push library for sending notifications.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Push_API
 */

import webpush from 'web-push';

// VAPID configuration from environment variables
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY ?? '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? 'mailto:admin@ftc-nihon.app';

/**
 * Check if push notifications are properly configured
 */
export function isPushConfigured(): boolean {
  return Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);
}

/**
 * Configure web-push with VAPID credentials
 * Call this before sending any notifications
 */
export function configureWebPush(): void {
  if (!isPushConfigured()) {
    console.warn('Push notifications not configured: Missing VAPID keys');
    return;
  }

  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

/**
 * Push subscription type matching the PushSubscription Web API
 */
export interface PushSubscriptionData {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Notification payload for push messages
 */
export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
  data?: Record<string, unknown>;
}

/**
 * Send a push notification to a subscription
 *
 * @param subscription - The user's push subscription
 * @param payload - The notification content
 * @returns Promise resolving when notification is sent
 */
export async function sendPushNotification(
  subscription: PushSubscriptionData,
  payload: NotificationPayload
): Promise<void> {
  if (!isPushConfigured()) {
    throw new Error('Push notifications not configured');
  }

  configureWebPush();

  const notificationData = {
    ...payload,
    icon: payload.icon ?? '/icon-192x192.png',
    badge: payload.badge ?? '/icon-192x192.png',
  };

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      },
      JSON.stringify(notificationData),
      {
        TTL: 24 * 60 * 60, // 24 hours
        urgency: 'normal',
      }
    );
  } catch (error) {
    // Handle subscription expiration
    if (error instanceof webpush.WebPushError) {
      if (error.statusCode === 410 || error.statusCode === 404) {
        throw new Error('SUBSCRIPTION_EXPIRED');
      }
      if (error.statusCode === 429) {
        throw new Error('RATE_LIMITED');
      }
    }
    throw error;
  }
}

/**
 * Get the public VAPID key for client-side subscription
 */
export function getVapidPublicKey(): string {
  return VAPID_PUBLIC_KEY;
}
