'use client';

import Link from 'next/link';
import { CurrencyConverter, useCurrencyConverter } from '@/components/ui/CurrencyConverter';

// Google Translate web URL
const GOOGLE_TRANSLATE_URL = 'https://translate.google.com/?sl=en&tl=ja&op=translate';

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
 * Conversation icon - two speech bubbles side by side, both pointing down
 */
function ConversationIcon() {
  return (
    <svg
      className="w-12 h-8 mt-1.5 text-foreground"
      viewBox="-1 -1 30 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Left bubble - higher, tail pointing down-left */}
      <path d="M1 2C1 1 2 0 3 0h6c1 0 2 1 2 2v5c0 1-1 2-2 2H6l-2 3V9c-1.5 0-3-1-3-2V2z" />
      {/* Right bubble - lower, tail pointing down-right */}
      <path d="M27 6c0-1-1-2-2-2h-6c-1 0-2 1-2 2v5c0 1 1 2 2 2h3l2 3v-3c1.5 0 3-1 3-2V6z" />
    </svg>
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
      <ConversationIcon />
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
          href={GOOGLE_TRANSLATE_URL}
          testId="quick-action-translate"
        />
      </div>
      <CurrencyConverter isOpen={currencyConverter.isOpen} onClose={currencyConverter.close} />
    </>
  );
}
