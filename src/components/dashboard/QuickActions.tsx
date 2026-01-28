'use client';

import { CurrencyConverter, useCurrencyConverter } from '@/components/ui/CurrencyConverter';
import { WeatherWidgetCompact } from './WeatherWidget';

// Google Translate URL - English to Japanese by default
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
 * Row of 3 utility widgets: Weather, Currency, Translate
 */
export function QuickActions() {
  const currencyConverter = useCurrencyConverter();

  return (
    <>
      <div className="grid grid-cols-3 gap-3" data-testid="quick-actions">
        <WeatherWidgetCompact />
        <UtilityWidget
          icon="¥ ↔ $"
          label="Currency"
          onClick={currencyConverter.open}
          testId="quick-action-currency"
        />
        <UtilityWidget
          href={GOOGLE_TRANSLATE_URL}
          icon="話す"
          label="Translate"
          external
          testId="quick-action-translate"
        />
      </div>
      <CurrencyConverter isOpen={currencyConverter.isOpen} onClose={currencyConverter.close} />
    </>
  );
}
