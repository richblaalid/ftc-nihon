'use client';

import Link from 'next/link';
import { CurrencyConverter, useCurrencyConverter } from '@/components/ui/CurrencyConverter';

interface QuickActionProps {
  href: string;
  icon: string;
  label: string;
  disabled?: boolean;
  external?: boolean;
  testId?: string;
}

function QuickAction({ href, icon, label, disabled, external, testId }: QuickActionProps) {
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

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        data-testid={testId}
        className={`${baseClasses} bg-background-secondary hover:bg-background-tertiary active:scale-95`}
      >
        <span className="text-2xl" aria-hidden="true">{icon}</span>
        <span className="text-xs font-medium text-foreground-secondary">{label}</span>
      </a>
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

interface QuickActionButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
  testId?: string;
}

export function QuickActionButton({ icon, label, onClick, testId }: QuickActionButtonProps) {
  const baseClasses =
    'flex flex-col items-center justify-center gap-1 rounded-xl p-4 transition-all duration-fast min-h-touch min-w-touch';

  return (
    <button
      onClick={onClick}
      data-testid={testId}
      className={`${baseClasses} bg-background-secondary hover:bg-background-tertiary active:scale-95`}
    >
      <span className="text-2xl" aria-hidden="true">{icon}</span>
      <span className="text-xs font-medium text-foreground-secondary">{label}</span>
    </button>
  );
}

// Google Translate URL - opens in browser/app
const GOOGLE_TRANSLATE_URL = 'https://translate.google.com/?sl=auto&tl=en&op=translate';

export function QuickActions() {
  const currencyConverter = useCurrencyConverter();

  return (
    <>
      <div className="grid grid-cols-4 gap-3" data-testid="quick-actions">
        <QuickAction href="/schedule" icon="📅" label="Schedule" testId="quick-action-schedule" />
        <QuickAction href="/map" icon="🗺️" label="Map" testId="quick-action-map" />
        <QuickAction href="/reservations" icon="🏨" label="Hotels" testId="quick-action-hotels" />
        <QuickActionButton
          icon="💱"
          label="Currency"
          onClick={currencyConverter.open}
          testId="quick-action-currency"
        />
      </div>
      <div className="grid grid-cols-4 gap-3 mt-3">
        <QuickAction
          href={GOOGLE_TRANSLATE_URL}
          icon="🌐"
          label="Translate"
          external
          testId="quick-action-translate"
        />
      </div>
      <CurrencyConverter isOpen={currencyConverter.isOpen} onClose={currencyConverter.close} />
    </>
  );
}
