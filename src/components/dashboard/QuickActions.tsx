'use client';

import Link from 'next/link';

interface QuickActionProps {
  href: string;
  icon: string;
  label: string;
  disabled?: boolean;
  testId?: string;
}

function QuickAction({ href, icon, label, disabled, testId }: QuickActionProps) {
  const baseClasses =
    'flex flex-col items-center justify-center gap-1 rounded-xl p-4 transition-all duration-fast min-h-touch min-w-touch';

  if (disabled) {
    return (
      <div
        className={`${baseClasses} cursor-not-allowed bg-background-tertiary`}
        data-testid={testId}
        aria-disabled="true"
      >
        <span className="text-2xl opacity-50" aria-hidden="true">{icon}</span>
        <span className="text-xs font-medium text-foreground-secondary">{label}</span>
      </div>
    );
  }

  return (
    <Link
      href={href}
      data-testid={testId}
      className={`${baseClasses} bg-background-secondary hover:bg-background-tertiary active:scale-95`}
    >
      <span className="text-2xl" aria-hidden="true">{icon}</span>
      <span className="text-xs font-medium text-foreground-secondary">{label}</span>
    </Link>
  );
}

export function QuickActions() {
  return (
    <div className="grid grid-cols-4 gap-3" data-testid="quick-actions">
      <QuickAction href="/schedule" icon="📅" label="Schedule" testId="quick-action-schedule" />
      <QuickAction href="/map" icon="🗺️" label="Map" testId="quick-action-map" />
      <QuickAction href="/reservations" icon="🏨" label="Hotels" testId="quick-action-hotels" />
      <QuickAction href="/assistant" icon="🤖" label="AI" disabled testId="quick-action-ai" />
    </div>
  );
}
