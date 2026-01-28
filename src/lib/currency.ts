/**
 * Currency Exchange Service
 *
 * Fetches USD to JPY exchange rate with daily caching.
 * Works offline by falling back to cached rates.
 */

const CACHE_KEY = 'ftc-exchange-rate';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// Free API - no key required
const EXCHANGE_API_URL = 'https://api.exchangerate-api.com/v4/latest/USD';

// Fallback rate if API fails and no cache (approximate rate for March 2026)
const FALLBACK_RATE = 150.0;

interface CachedRate {
  rate: number;
  timestamp: number;
  isOffline?: boolean;
}

interface ExchangeRateResult {
  rate: number;
  lastUpdated: Date;
  isOffline: boolean;
  isFallback: boolean;
}

/**
 * Get cached exchange rate from localStorage
 */
function getCachedRate(): CachedRate | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    return JSON.parse(cached) as CachedRate;
  } catch {
    return null;
  }
}

/**
 * Save exchange rate to cache
 */
function setCachedRate(rate: number): void {
  try {
    const cached: CachedRate = {
      rate,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
  } catch (error) {
    console.warn('[Currency] Failed to cache rate:', error);
  }
}

/**
 * Check if cached rate is still valid (less than 24 hours old)
 */
function isCacheValid(cached: CachedRate): boolean {
  return Date.now() - cached.timestamp < CACHE_DURATION_MS;
}

/**
 * Fetch fresh exchange rate from API
 */
async function fetchExchangeRate(): Promise<number | null> {
  try {
    const response = await fetch(EXCHANGE_API_URL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    const rate = data.rates?.JPY;

    if (typeof rate !== 'number' || rate <= 0) {
      throw new Error('Invalid rate in response');
    }

    return rate;
  } catch (error) {
    console.warn('[Currency] Failed to fetch rate:', error);
    return null;
  }
}

/**
 * Get the current USD to JPY exchange rate
 *
 * - Fetches fresh rate if online and cache is stale
 * - Returns cached rate if available
 * - Falls back to hardcoded rate as last resort
 */
export async function getExchangeRate(): Promise<ExchangeRateResult> {
  const cached = getCachedRate();

  // If online and cache is stale or missing, try to fetch fresh rate
  if (navigator.onLine) {
    if (!cached || !isCacheValid(cached)) {
      const freshRate = await fetchExchangeRate();

      if (freshRate !== null) {
        setCachedRate(freshRate);
        return {
          rate: freshRate,
          lastUpdated: new Date(),
          isOffline: false,
          isFallback: false,
        };
      }
    }
  }

  // Return cached rate if available
  if (cached) {
    return {
      rate: cached.rate,
      lastUpdated: new Date(cached.timestamp),
      isOffline: !navigator.onLine || !isCacheValid(cached),
      isFallback: false,
    };
  }

  // Last resort: return fallback rate
  return {
    rate: FALLBACK_RATE,
    lastUpdated: new Date(),
    isOffline: true,
    isFallback: true,
  };
}

/**
 * Convert USD to JPY
 */
export function usdToJpy(usd: number, rate: number): number {
  return Math.round(usd * rate);
}

/**
 * Convert JPY to USD
 */
export function jpyToUsd(jpy: number, rate: number): number {
  return Math.round((jpy / rate) * 100) / 100;
}

/**
 * Format JPY amount with proper grouping
 */
export function formatJpy(amount: number): string {
  return `¥${amount.toLocaleString('ja-JP')}`;
}

/**
 * Format USD amount with dollar sign
 */
export function formatUsd(amount: number): string {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format the "last updated" timestamp for display
 */
export function formatLastUpdated(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) {
    return 'Just now';
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  } else {
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }
}
