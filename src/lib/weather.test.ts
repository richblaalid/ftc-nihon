import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  getCachedWeather,
  isCacheFresh,
  fetchWeather,
  getWeather,
  type WeatherData,
} from './weather';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('weather', () => {
  beforeEach(() => {
    localStorageMock.clear();
    mockFetch.mockReset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getCachedWeather', () => {
    it('returns null when no cache exists', () => {
      expect(getCachedWeather()).toBeNull();
    });

    it('returns cached weather data', () => {
      const weatherData: WeatherData & { cachedAt: number } = {
        temperature: 55,
        tempHigh: 60,
        tempLow: 50,
        condition: 'Clear',
        icon: '☀️',
        humidity: 65,
        precipitationChance: 10,
        city: 'Tokyo',
        updatedAt: '2026-03-10T12:00:00Z',
        cachedAt: Date.now(),
      };

      localStorageMock.setItem('ftc-weather-cache', JSON.stringify(weatherData));

      const result = getCachedWeather();
      expect(result).not.toBeNull();
      expect(result?.temperature).toBe(55);
      expect(result?.city).toBe('Tokyo');
      expect(result?.condition).toBe('Clear');
    });

    it('handles invalid JSON gracefully', () => {
      localStorageMock.setItem('ftc-weather-cache', 'not valid json');
      expect(getCachedWeather()).toBeNull();
    });
  });

  describe('isCacheFresh', () => {
    it('returns false when no cache exists', () => {
      expect(isCacheFresh()).toBe(false);
    });

    it('returns true when cache is within 30 minutes', () => {
      const weatherData = {
        temperature: 55,
        tempHigh: 60,
        tempLow: 50,
        condition: 'Clear',
        icon: '☀️',
        humidity: 65,
        city: 'Tokyo',
        updatedAt: '2026-03-10T12:00:00Z',
        cachedAt: Date.now() - 10 * 60 * 1000, // 10 minutes ago
      };

      localStorageMock.setItem('ftc-weather-cache', JSON.stringify(weatherData));
      expect(isCacheFresh()).toBe(true);
    });

    it('returns false when cache is older than 30 minutes', () => {
      const weatherData = {
        temperature: 55,
        tempHigh: 60,
        tempLow: 50,
        condition: 'Clear',
        icon: '☀️',
        humidity: 65,
        city: 'Tokyo',
        updatedAt: '2026-03-10T12:00:00Z',
        cachedAt: Date.now() - 31 * 60 * 1000, // 31 minutes ago
      };

      localStorageMock.setItem('ftc-weather-cache', JSON.stringify(weatherData));
      expect(isCacheFresh()).toBe(false);
    });
  });

  describe('fetchWeather', () => {
    it('returns null and logs warning for unknown city', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await fetchWeather('Unknown City');

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('[Weather] Unknown city: Unknown City');

      consoleSpy.mockRestore();
    });

    it('returns cached data when cache is fresh', async () => {
      const cachedData = {
        temperature: 55,
        tempHigh: 60,
        tempLow: 50,
        condition: 'Clear',
        icon: '☀️',
        humidity: 65,
        city: 'Tokyo',
        updatedAt: '2026-03-10T12:00:00Z',
        cachedAt: Date.now() - 5 * 60 * 1000, // 5 minutes ago
      };

      localStorageMock.setItem('ftc-weather-cache', JSON.stringify(cachedData));

      const result = await fetchWeather('Tokyo');

      expect(result).not.toBeNull();
      expect(result?.temperature).toBe(55);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('fetches from API when cache is stale', async () => {
      const staleData = {
        temperature: 55,
        tempHigh: 60,
        tempLow: 50,
        condition: 'Clear',
        icon: '☀️',
        humidity: 65,
        city: 'Tokyo',
        updatedAt: '2026-03-10T12:00:00Z',
        cachedAt: Date.now() - 31 * 60 * 1000, // 31 minutes ago
      };

      localStorageMock.setItem('ftc-weather-cache', JSON.stringify(staleData));

      const apiResponse = {
        current: {
          temperature_2m: 58,
          relative_humidity_2m: 70,
          weather_code: 0,
        },
        daily: {
          temperature_2m_max: [65],
          temperature_2m_min: [52],
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(apiResponse),
      });

      const result = await fetchWeather('Tokyo');

      expect(result).not.toBeNull();
      expect(result?.temperature).toBe(58);
      expect(result?.tempHigh).toBe(65);
      expect(result?.tempLow).toBe(52);
      expect(result?.condition).toBe('Clear');
      expect(mockFetch).toHaveBeenCalled();
    });

    it('returns cached data on API error', async () => {
      const cachedData = {
        temperature: 55,
        tempHigh: 60,
        tempLow: 50,
        condition: 'Clear',
        icon: '☀️',
        humidity: 65,
        city: 'Tokyo',
        updatedAt: '2026-03-10T12:00:00Z',
        cachedAt: Date.now() - 31 * 60 * 1000,
      };

      localStorageMock.setItem('ftc-weather-cache', JSON.stringify(cachedData));

      mockFetch.mockRejectedValue(new Error('Network error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await fetchWeather('Tokyo');

      expect(result).not.toBeNull();
      expect(result?.temperature).toBe(55);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('getWeather', () => {
    it('returns cached data when offline', async () => {
      const cachedData = {
        temperature: 55,
        tempHigh: 60,
        tempLow: 50,
        condition: 'Clear',
        icon: '☀️',
        humidity: 65,
        city: 'Tokyo',
        updatedAt: '2026-03-10T12:00:00Z',
        cachedAt: Date.now() - 31 * 60 * 1000,
      };

      localStorageMock.setItem('ftc-weather-cache', JSON.stringify(cachedData));

      // Mock offline state
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true,
      });

      const result = await getWeather('Tokyo');

      expect(result).not.toBeNull();
      expect(result?.temperature).toBe(55);
      expect(mockFetch).not.toHaveBeenCalled();

      // Restore online state
      Object.defineProperty(navigator, 'onLine', {
        value: true,
        writable: true,
      });
    });

    it('calls fetchWeather when online', async () => {
      const apiResponse = {
        current: {
          temperature_2m: 58,
          relative_humidity_2m: 70,
          weather_code: 1,
        },
        daily: {
          temperature_2m_max: [65],
          temperature_2m_min: [52],
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(apiResponse),
      });

      Object.defineProperty(navigator, 'onLine', {
        value: true,
        writable: true,
      });

      const result = await getWeather('Kyoto');

      expect(result).not.toBeNull();
      expect(result?.condition).toBe('Mostly Clear');
      expect(mockFetch).toHaveBeenCalled();
    });
  });
});
