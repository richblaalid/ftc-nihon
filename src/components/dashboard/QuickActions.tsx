'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { CurrencyConverter, useCurrencyConverter } from '@/components/ui/CurrencyConverter';

// Google Translate URLs
const GOOGLE_TRANSLATE_APP_URL = 'googletranslate://?sl=en&tl=ja';
const GOOGLE_TRANSLATE_APP_STORE_URL = 'https://apps.apple.com/app/google-translate/id414706506';

/**
 * Hook for managing Google Translate app opening with fallback prompt
 */
function useTranslateApp() {
  const [showPrompt, setShowPrompt] = useState(false);

  const openApp = useCallback(() => {
    // Track if the page loses focus (app opened successfully)
    let appOpened = false;

    const handleBlur = () => {
      appOpened = true;
    };

    window.addEventListener('blur', handleBlur);

    // Try to open the app
    window.location.href = GOOGLE_TRANSLATE_APP_URL;

    // Check after delay if we're still here
    setTimeout(() => {
      window.removeEventListener('blur', handleBlur);
      // If page still has focus and wasn't blurred, app didn't open
      if (!appOpened && document.hasFocus()) {
        setShowPrompt(true);
      }
    }, 1500);
  }, []);

  const closePrompt = useCallback(() => {
    setShowPrompt(false);
  }, []);

  const openAppStore = useCallback(() => {
    setShowPrompt(false);
    window.open(GOOGLE_TRANSLATE_APP_STORE_URL, '_blank');
  }, []);

  return { showPrompt, openApp, closePrompt, openAppStore };
}

/**
 * Modal prompt to download Google Translate app
 */
function TranslateAppPrompt({
  isOpen,
  onClose,
  onGetApp
}: {
  isOpen: boolean;
  onClose: () => void;
  onGetApp: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-surface rounded-2xl p-6 max-w-sm w-full shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <span className="text-4xl">🌐</span>
          <h3 className="mt-3 text-lg font-semibold text-foreground">
            Google Translate App
          </h3>
          <p className="mt-2 text-sm text-foreground-secondary">
            The Google Translate app isn&apos;t installed. Would you like to get it from the App Store?
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={onGetApp}
            className="w-full py-3 px-4 bg-primary text-white font-medium rounded-xl hover:bg-primary-hover transition-colors"
          >
            Get from App Store
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 px-4 text-foreground-secondary font-medium rounded-xl hover:bg-background-secondary transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
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
  const translateApp = useTranslateApp();

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
          onClick={translateApp.openApp}
          testId="quick-action-translate"
        />
      </div>
      <CurrencyConverter isOpen={currencyConverter.isOpen} onClose={currencyConverter.close} />
      <TranslateAppPrompt
        isOpen={translateApp.showPrompt}
        onClose={translateApp.closePrompt}
        onGetApp={translateApp.openAppStore}
      />
    </>
  );
}
