'use client';

/**
 * NotificationPreferences Component
 *
 * Allows users to toggle individual notification types on/off.
 * Shows toggles for morning briefings, departure reminders, and deadline alerts.
 */

import { useState, useEffect } from 'react';
import {
  getNotificationPreferences,
  saveNotificationPreferences,
  type NotificationPreferences as Prefs,
} from '@/lib/notifications';

interface ToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

function Toggle({ label, description, checked, onChange, disabled }: ToggleProps) {
  return (
    <label className={`flex items-start gap-3 py-2 ${disabled ? 'opacity-50' : 'cursor-pointer'}`}>
      <div className="flex-1">
        <div className="text-sm font-medium text-foreground">{label}</div>
        <div className="text-xs text-foreground-tertiary mt-0.5">{description}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`
          relative w-11 h-6 rounded-full transition-colors shrink-0
          ${checked ? 'bg-primary' : 'bg-foreground-tertiary/30'}
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span
          className={`
            absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow
            transition-transform duration-fast
            ${checked ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
    </label>
  );
}

export function NotificationPreferences() {
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load preferences on mount
    const loadedPrefs = getNotificationPreferences();
    setPrefs(loadedPrefs);
    setIsLoading(false);
  }, []);

  const updatePref = (key: keyof Prefs, value: boolean) => {
    if (!prefs) return;

    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    saveNotificationPreferences(updated);
  };

  if (isLoading || !prefs) {
    return (
      <div className="text-sm text-foreground-secondary">Loading preferences...</div>
    );
  }

  // If notifications aren't enabled, show a message
  if (!prefs.enabled) {
    return (
      <div className="text-sm text-foreground-secondary">
        Enable notifications above to configure preferences.
      </div>
    );
  }

  return (
    <div className="space-y-1 divide-y divide-background-secondary">
      <Toggle
        label="Morning Briefing"
        description="Daily summary at 8:00 AM with today's highlights"
        checked={prefs.morningBriefing}
        onChange={(checked) => updatePref('morningBriefing', checked)}
      />
      <Toggle
        label="Departure Reminders"
        description="30 minutes before it's time to leave for activities"
        checked={prefs.departureReminders}
        onChange={(checked) => updatePref('departureReminders', checked)}
      />
      <Toggle
        label="Deadline Alerts"
        description="1 hour before timed entries (tickets, reservations)"
        checked={prefs.deadlineAlerts}
        onChange={(checked) => updatePref('deadlineAlerts', checked)}
      />
    </div>
  );
}
