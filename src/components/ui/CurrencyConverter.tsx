'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getExchangeRate,
  usdToJpy,
  jpyToUsd,
  formatJpy,
  formatUsd,
  formatLastUpdated,
} from '@/lib/currency';

interface CurrencyConverterProps {
  isOpen: boolean;
  onClose: () => void;
}

type ConversionDirection = 'usd-to-jpy' | 'jpy-to-usd';

/**
 * Currency converter modal with two-way USD/JPY conversion
 */
export function CurrencyConverter({ isOpen, onClose }: CurrencyConverterProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [direction, setDirection] = useState<ConversionDirection>('usd-to-jpy');
  const [rate, setRate] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load exchange rate when modal opens
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional for loading state
      setIsLoading(true);
      getExchangeRate().then((result) => {
        setRate(result.rate);
        setLastUpdated(result.lastUpdated);
        setIsOffline(result.isOffline);
        setIsFallback(result.isFallback);
        setIsLoading(false);
      });
    }
  }, [isOpen]);

  // Handle open/close animations
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional for animation
      setIsVisible(true);
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Calculate converted amount
  const getConvertedAmount = useCallback((): string => {
    if (!rate || !inputValue) return '—';

    const numValue = parseFloat(inputValue.replace(/,/g, ''));
    if (isNaN(numValue) || numValue <= 0) return '—';

    if (direction === 'usd-to-jpy') {
      return formatJpy(usdToJpy(numValue, rate));
    } else {
      return formatUsd(jpyToUsd(numValue, rate));
    }
  }, [rate, inputValue, direction]);

  // Swap conversion direction
  const handleSwap = () => {
    setDirection((prev) => (prev === 'usd-to-jpy' ? 'jpy-to-usd' : 'usd-to-jpy'));
    setInputValue('');
  };

  // Handle input change with number formatting
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d.]/g, '');
    // Allow only one decimal point
    const parts = value.split('.');
    if (parts.length > 2) return;
    // Limit decimal places to 2
    if (parts[1] && parts[1].length > 2) return;
    setInputValue(value);
  };

  // Clear input
  const handleClear = () => {
    setInputValue('');
  };

  if (!isVisible) return null;

  const fromCurrency = direction === 'usd-to-jpy' ? 'USD' : 'JPY';
  const toCurrency = direction === 'usd-to-jpy' ? 'JPY' : 'USD';
  const placeholder = direction === 'usd-to-jpy' ? '0.00' : '0';

  return (
    <div className="fixed inset-0 z-[200]">
      {/* Backdrop */}
      <div
        className={`
          absolute inset-0 bg-black/60 backdrop-blur-sm
          transition-opacity duration-300
          ${isAnimating ? 'opacity-100' : 'opacity-0'}
        `}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="currency-converter-title"
        className={`
          absolute inset-x-4 top-1/2 -translate-y-1/2
          bg-background dark:bg-surface rounded-3xl
          shadow-2xl
          transform transition-all duration-300 ease-out
          ${isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
          max-w-md mx-auto overflow-hidden
        `}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-foreground-tertiary/20">
          <div className="flex items-center justify-between">
            <h2 id="currency-converter-title" className="text-xl font-bold text-foreground">
              Currency Converter
            </h2>
            <button
              onClick={onClose}
              className="p-2 -m-2 text-foreground-secondary hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Input section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground-secondary">{fromCurrency}</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-foreground-secondary">
                {direction === 'usd-to-jpy' ? '$' : '¥'}
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={inputValue}
                onChange={handleInputChange}
                placeholder={placeholder}
                className="w-full pl-10 pr-12 py-4 text-2xl font-bold text-foreground bg-background-secondary dark:bg-background rounded-xl border border-foreground-tertiary/20 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                autoFocus
              />
              {inputValue && (
                <button
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-foreground-tertiary hover:text-foreground-secondary"
                  aria-label="Clear"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Swap button */}
          <div className="flex justify-center">
            <button
              onClick={handleSwap}
              className="p-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-full transition-colors active:scale-95"
              aria-label="Swap currencies"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          </div>

          {/* Output section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground-secondary">{toCurrency}</label>
            <div className="px-4 py-4 bg-background-secondary dark:bg-background rounded-xl border border-foreground-tertiary/20">
              <p className="text-2xl font-bold text-primary">
                {isLoading ? '...' : getConvertedAmount()}
              </p>
            </div>
          </div>

          {/* Exchange rate info */}
          <div className="pt-3 border-t border-foreground-tertiary/20">
            {isLoading ? (
              <p className="text-sm text-foreground-tertiary text-center">Loading rate...</p>
            ) : (
              <div className="text-center space-y-1">
                <p className="text-sm text-foreground-secondary">
                  <span className="font-medium">1 USD = {rate?.toLocaleString('en-US', { maximumFractionDigits: 2 })} JPY</span>
                </p>
                <p className="text-xs text-foreground-tertiary">
                  {isOffline && (
                    <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {isFallback ? 'Using estimated rate' : 'Using cached rate'}
                      {' • '}
                    </span>
                  )}
                  Updated {lastUpdated ? formatLastUpdated(lastUpdated) : 'never'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to manage currency converter state
 */
export function useCurrencyConverter() {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, open, close, toggle };
}
