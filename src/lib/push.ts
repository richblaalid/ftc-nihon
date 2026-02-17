/**
 * Web Push Notification Utilities
 *
 * Server-side utilities for sending push notifications using Web Push protocol.
 * Client-side subscription management for PWA.
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

// ============================================
// Client-side utilities (for browser use)
// ============================================

/**
 * Check if push notifications are supported in this browser
 */
export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Check current notification permission status
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isPushSupported()) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Request notification permission from the user
 * @returns The permission result
 */
export async function requestNotificationPermission(): Promise<
  NotificationPermission | 'unsupported'
> {
  if (!isPushSupported()) {
    return 'unsupported';
  }

  const result = await Notification.requestPermission();
  return result;
}

/**
 * Convert a base64 string to a Uint8Array (for VAPID key)
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Subscribe the user to push notifications
 * @returns The push subscription or null if failed
 */
export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!isPushSupported()) {
    console.warn('Push notifications not supported');
    return null;
  }

  const permission = await requestNotificationPermission();
  if (permission !== 'granted') {
    console.warn('Notification permission denied');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

    if (!vapidPublicKey) {
      console.error('VAPID public key not configured');
      return null;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push:', error);
    return null;
  }
}

/**
 * Unsubscribe from push notifications
 * @returns True if unsubscribed successfully
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  if (!isPushSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to unsubscribe from push:', error);
    return false;
  }
}

/**
 * Get the current push subscription if any
 * @returns The current subscription or null
 */
export async function getCurrentSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (error) {
    console.error('Failed to get push subscription:', error);
    return null;
  }
}
