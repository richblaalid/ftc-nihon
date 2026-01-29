'use client';

import Link from 'next/link';
import { CurrencyConverter, useCurrencyConverter } from '@/components/ui/CurrencyConverter';

// Google Translate URLs
const GOOGLE_TRANSLATE_WEB_URL = 'https://translate.google.com/?sl=en&tl=ja&op=translate';
// Google Translate app URL scheme (iOS)
const GOOGLE_TRANSLATE_APP_URL = 'googletranslate://?sl=en&tl=ja';

/**
 * Try to open Google Translate app, fall back to web if not installed
 */
function openGoogleTranslate() {
  // Create a hidden iframe to try opening the app
  // This prevents the "can't open" error from showing
  const start = Date.now();

  // Try to open the app
  window.location.href = GOOGLE_TRANSLATE_APP_URL;

  // If we're still here after a short delay, the app didn't open
  // Fall back to web version
  setTimeout(() => {
    // If less than 2 seconds passed, the app probably didn't open
    if (Date.now() - start < 2000) {
      window.open(GOOGLE_TRANSLATE_WEB_URL, '_blank');
    }
  }, 500);
}

/**
 * Utility widget button - matches card style of weather widget
 */
interface UtilityWidgetProps {
  icon: string;
  label: string;
  onClick?: () => void;
  href?: string;
  external?: boolean;
  testId?: string;
}

function UtilityWidget({ icon, label, onClick, href, external, testId }: UtilityWidgetProps) {
  const baseClasses =
    'card flex flex-col items-center justify-center p-3 transition-all active:scale-95 cursor-pointer hover:bg-background-secondary';

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          data-testid={testId}
          className={baseClasses}
        >
          <span className="text-2xl font-bold text-foreground" aria-hidden="true">{icon}</span>
          <p className="text-sm font-medium text-foreground-secondary mt-2">{label}</p>
        </a>
      );
    }
    return (
      <a href={href} data-testid={testId} className={baseClasses}>
        <span className="text-2xl font-bold text-foreground" aria-hidden="true">{icon}</span>
        <p className="text-sm font-medium text-foreground-secondary mt-2">{label}</p>
      </a>
    );
  }

  return (
    <button onClick={onClick} data-testid={testId} className={baseClasses}>
      <span className="text-2xl font-bold text-foreground" aria-hidden="true">{icon}</span>
      <p className="text-sm font-medium text-foreground-secondary mt-2">{label}</p>
    </button>
  );
}

/**
 * Phrases link widget
 */
function PhrasesWidget() {
  return (
    <Link
      href="/phrases"
      className="card flex flex-col items-center justify-center p-3 transition-all active:scale-95 cursor-pointer hover:bg-background-secondary"
      data-testid="quick-action-phrases"
    >
      <span className="text-2xl" aria-hidden="true">🗣️</span>
      <p className="text-sm font-medium text-foreground-secondary mt-2">Phrases</p>
    </Link>
  );
}

/**
 * Row of 3 utility widgets: Exchange, Phrases, Translate
 */
export function QuickActions() {
  const currencyConverter = useCurrencyConverter();

  return (
    <>
      <div className="grid grid-cols-3 gap-3" data-testid="quick-actions">
        <UtilityWidget
          icon="¥ ↔ $"
          label="Exchange"
          onClick={currencyConverter.open}
          testId="quick-action-currency"
        />
        <PhrasesWidget />
        <UtilityWidget
          icon="話す"
          label="Translate"
          onClick={openGoogleTranslate}
          testId="quick-action-translate"
        />
      </div>
      <CurrencyConverter isOpen={currencyConverter.isOpen} onClose={currencyConverter.close} />
    </>
  );
}
