'use client';

import Link from 'next/link';

interface QuickActionProps {
  href: string;
  icon: string;
  label: string;
  disabled?: boolean;
}

function QuickAction({ href, icon, label, disabled }: QuickActionProps) {
  const baseClasses =
    'flex flex-col items-center justify-center gap-1 rounded-xl p-4 transition-all duration-fast min-h-touch min-w-touch';

  if (disabled) {
    return (
      <div className={`${baseClasses} cursor-not-allowed bg-background-tertiary`}>
        <span className="text-2xl opacity-50">{icon}</span>
        <span className="text-xs font-medium text-foreground-secondary">{label}</span>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={`${baseClasses} bg-background-secondary hover:bg-background-tertiary active:scale-95`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-medium text-foreground-secondary">{label}</span>
    </Link>
  );
}

export function QuickActions() {
  return (
    <div className="grid grid-cols-4 gap-3">
      <QuickAction href="/schedule" icon="📅" label="Schedule" />
      <QuickAction href="/map" icon="🗺️" label="Map" />
      <QuickAction href="/reservations" icon="🏨" label="Hotels" />
      <QuickAction href="/assistant" icon="🤖" label="AI" disabled />
    </div>
  );
}
