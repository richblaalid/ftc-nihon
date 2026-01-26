'use client';

import { useState } from 'react';
import { useUrgentAlerts } from '@/db/hooks';
import type { Alert } from '@/types/database';

interface AlertItemProps {
  alert: Alert;
  onDismiss: (id: string) => void;
}

function AlertItem({ alert, onDismiss }: AlertItemProps) {
  const bgColor =
    alert.type === 'urgent'
      ? 'bg-error/10 border-error/30'
      : alert.type === 'warning'
        ? 'bg-warning/10 border-warning/30'
        : 'bg-info/10 border-info/30';

  const textColor =
    alert.type === 'urgent'
      ? 'text-error'
      : alert.type === 'warning'
        ? 'text-warning'
        : 'text-info';

  const icon = alert.type === 'urgent' ? '🚨' : alert.type === 'warning' ? '⚠️' : 'ℹ️';

  return (
    <div className={`flex items-start gap-3 rounded-lg border p-3 ${bgColor}`}>
      <span className="text-lg">{icon}</span>
      <div className="flex-1">
        <p className={`text-sm font-medium ${textColor}`}>{alert.message}</p>
      </div>
      <button
        onClick={() => onDismiss(alert.id)}
        className="min-h-touch min-w-touch rounded p-1 text-foreground-tertiary hover:bg-background-secondary"
        aria-label="Dismiss alert"
      >
        ✕
      </button>
    </div>
  );
}

export function AlertBanner() {
  const alerts = useUrgentAlerts(2); // Within 2 hours
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  // Loading state
  if (alerts === undefined) {
    return null; // Don't show loading state for alerts
  }

  // Filter out dismissed alerts
  const visibleAlerts = alerts.filter((a) => !dismissedIds.has(a.id));

  if (visibleAlerts.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      {visibleAlerts.map((alert) => (
        <AlertItem key={alert.id} alert={alert} onDismiss={handleDismiss} />
      ))}
    </div>
  );
}
