'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  isPushSupported,
  getNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  getCurrentSubscription,
} from '@/lib/push';

type PermissionState = 'loading' | 'unsupported' | 'prompt' | 'granted' | 'denied';

interface NotificationPromptProps {
  /** Callback when subscription changes */
  onSubscriptionChange?: (subscription: PushSubscription | null) => void;
  /** Show as compact inline version (for settings) */
  compact?: boolean;
}

/**
 * Component for managing push notification permissions and subscriptions.
 * Explains the value proposition and handles the permission flow.
 */
export function NotificationPrompt({
  onSubscriptionChange,
  compact = false,
}: NotificationPromptProps) {
  const [permissionState, setPermissionState] = useState<PermissionState>('loading');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check initial state
  useEffect(() => {
    const checkState = async () => {
      if (!isPushSupported()) {
        setPermissionState('unsupported');
        return;
      }

      const permission = getNotificationPermission();
      if (permission === 'unsupported') {
        setPermissionState('unsupported');
        return;
      }

      setPermissionState(permission === 'default' ? 'prompt' : permission);

      // Get existing subscription
      if (permission === 'granted') {
        const existingSub = await getCurrentSubscription();
        setSubscription(existingSub);
        onSubscriptionChange?.(existingSub);
      }
    };

    checkState();
  }, [onSubscriptionChange]);

  // Handle enable notifications
  const handleEnableNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const sub = await subscribeToPush();
      if (sub) {
        setSubscription(sub);
        setPermissionState('granted');
        onSubscriptionChange?.(sub);
      } else {
        // Permission was denied
        const currentPermission = getNotificationPermission();
        setPermissionState(currentPermission === 'denied' ? 'denied' : 'prompt');
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [onSubscriptionChange]);

  // Handle disable notifications
  const handleDisableNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      await unsubscribeFromPush();
      setSubscription(null);
      onSubscriptionChange?.(null);
    } catch (error) {
      console.error('Failed to disable notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [onSubscriptionChange]);

  // Loading state
  if (permissionState === 'loading') {
    return (
      <div className={compact ? 'py-2' : 'card'}>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm text-foreground-secondary">Checking notification support...</span>
        </div>
      </div>
    );
  }

  // Unsupported state
  if (permissionState === 'unsupported') {
    return (
      <div className={compact ? 'py-2' : 'card'}>
        <div className="flex items-start gap-3">
          <span className="text-xl" role="img" aria-hidden="true">
            ⚠️
          </span>
          <div>
            <p className="font-medium text-foreground">Notifications Not Supported</p>
            <p className="text-sm text-foreground-secondary mt-1">
              Your browser doesn&apos;t support push notifications. For the best experience, install
              this app to your home screen on iOS 16.4+ Safari.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Denied state
  if (permissionState === 'denied') {
    return (
      <div className={compact ? 'py-2' : 'card'}>
        <div className="flex items-start gap-3">
          <span className="text-xl" role="img" aria-hidden="true">
            🔕
          </span>
          <div>
            <p className="font-medium text-foreground">Notifications Blocked</p>
            <p className="text-sm text-foreground-secondary mt-1">
              You&apos;ve blocked notifications for this app. To enable them, go to your device
              settings and allow notifications for FTC: Nihon.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Granted state (with subscription toggle)
  if (permissionState === 'granted') {
    if (compact) {
      return (
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <span className="text-lg" role="img" aria-hidden="true">
              🔔
            </span>
            <span className="text-sm text-foreground">
              {subscription ? 'Notifications enabled' : 'Notifications paused'}
            </span>
          </div>
          <button
            onClick={subscription ? handleDisableNotifications : handleEnableNotifications}
            disabled={isLoading}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              subscription
                ? 'bg-background-secondary text-foreground-secondary hover:bg-background-tertiary'
                : 'bg-primary text-on-primary hover:opacity-90'
            } disabled:opacity-50`}
          >
            {isLoading ? '...' : subscription ? 'Disable' : 'Enable'}
          </button>
        </div>
      );
    }

    return (
      <div className="card">
        <div className="flex items-start gap-3">
          <span className="text-2xl" role="img" aria-hidden="true">
            {subscription ? '🔔' : '🔕'}
          </span>
          <div className="flex-1">
            <p className="font-medium text-foreground">
              {subscription ? 'Notifications Enabled' : 'Notifications Paused'}
            </p>
            <p className="text-sm text-foreground-secondary mt-1">
              {subscription
                ? "You'll receive reminders for departures, hard deadlines, and daily briefings."
                : 'Enable notifications to stay on schedule during your trip.'}
            </p>
            <button
              onClick={subscription ? handleDisableNotifications : handleEnableNotifications}
              disabled={isLoading}
              className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                subscription
                  ? 'bg-background-secondary text-foreground-secondary hover:bg-background-tertiary'
                  : 'bg-primary text-on-primary hover:opacity-90'
              } disabled:opacity-50`}
            >
              {isLoading
                ? 'Processing...'
                : subscription
                  ? 'Disable Notifications'
                  : 'Enable Notifications'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Prompt state (initial ask)
  if (compact) {
    return (
      <div className="py-2">
        <button
          onClick={handleEnableNotifications}
          disabled={isLoading}
          className="flex items-center gap-2 text-primary hover:underline disabled:opacity-50"
        >
          <span className="text-lg" role="img" aria-hidden="true">
            🔔
          </span>
          <span className="text-sm font-medium">
            {isLoading ? 'Requesting...' : 'Enable notifications'}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="card bg-primary/5 border border-primary/20">
      <div className="flex items-start gap-3">
        <span className="text-2xl" role="img" aria-hidden="true">
          🔔
        </span>
        <div className="flex-1">
          <p className="font-semibold text-foreground">Stay on Schedule</p>
          <ul className="text-sm text-foreground-secondary mt-2 space-y-1">
            <li>• Daily morning briefings at 8:00 AM</li>
            <li>• Departure reminders 30 min before leave time</li>
            <li>• Hard deadline alerts for timed entries</li>
          </ul>
          <button
            onClick={handleEnableNotifications}
            disabled={isLoading}
            className="mt-4 w-full py-2.5 bg-primary text-on-primary rounded-lg font-medium
                       hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {isLoading ? 'Requesting Permission...' : 'Enable Notifications'}
          </button>
          <p className="text-xs text-foreground-tertiary mt-2 text-center">
            You can change this later in Settings
          </p>
        </div>
      </div>
    </div>
  );
}
