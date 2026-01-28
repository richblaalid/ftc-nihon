'use client';

import { useEffect, useState } from 'react';
import { getWeather, getCachedWeather, type WeatherData } from '@/lib/weather';
import { useCurrentDayNumber } from '@/db/hooks';
import { DAY_CITIES } from '@/types/database';

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const dayNumber = useCurrentDayNumber();

  // Get current city based on day number
  const city = dayNumber ? DAY_CITIES[dayNumber] ?? 'Tokyo' : 'Tokyo';

  useEffect(() => {
    let mounted = true;

    async function loadWeather() {
      // Try cached data first for instant display
      const cached = getCachedWeather();
      if (cached && mounted) {
        setWeather(cached);
        setIsLoading(false);
      }

      // Then fetch fresh data
      const fresh = await getWeather(city);
      if (fresh && mounted) {
        setWeather(fresh);
      }
      if (mounted) {
        setIsLoading(false);
      }
    }

    loadWeather();

    // Refresh weather every 30 minutes
    const interval = setInterval(loadWeather, 30 * 60 * 1000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [city]);

  // Loading state
  if (isLoading && !weather) {
    return (
      <div className="card flex animate-pulse items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-background-secondary" />
        <div className="flex-1">
          <div className="h-4 w-20 rounded bg-background-secondary" />
          <div className="mt-1 h-6 w-16 rounded bg-background-secondary" />
        </div>
      </div>
    );
  }

  // No weather data
  if (!weather) {
    return (
      <div className="card flex items-center gap-4">
        <span className="text-4xl">🌡️</span>
        <div>
          <p className="text-sm text-foreground-tertiary">{city}</p>
          <p className="text-foreground-secondary">Weather unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card flex items-center gap-3 p-3">
      {/* Weather icon */}
      <span className="text-3xl">{weather.icon}</span>

      {/* Temperature and condition */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-foreground-tertiary truncate">{weather.city}</p>
        <p className="text-xl font-semibold text-foreground">{weather.temperature}°F</p>
        <p className="text-xs text-foreground-tertiary">
          {weather.tempHigh}°/{weather.tempLow}°
        </p>
      </div>
    </div>
  );
}

/**
 * Compact weather widget for use in utility row
 */
export function WeatherWidgetCompact() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const dayNumber = useCurrentDayNumber();

  const city = dayNumber ? DAY_CITIES[dayNumber] ?? 'Tokyo' : 'Tokyo';

  useEffect(() => {
    let mounted = true;

    async function loadWeather() {
      const cached = getCachedWeather();
      if (cached && mounted) {
        setWeather(cached);
        setIsLoading(false);
      }

      const fresh = await getWeather(city);
      if (fresh && mounted) {
        setWeather(fresh);
      }
      if (mounted) {
        setIsLoading(false);
      }
    }

    loadWeather();
    const interval = setInterval(loadWeather, 30 * 60 * 1000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [city]);

  if (isLoading && !weather) {
    return (
      <div className="card flex flex-col items-center justify-center p-3 animate-pulse">
        <div className="h-8 w-8 rounded-full bg-background-secondary" />
        <div className="mt-2 h-5 w-14 rounded bg-background-secondary" />
        <div className="mt-1 h-3 w-16 rounded bg-background-secondary" />
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="card flex flex-col items-center justify-center p-3">
        <span className="text-2xl">🌡️</span>
        <p className="text-lg font-bold text-foreground">--°F</p>
        <p className="text-xs text-foreground-tertiary">--° / --°</p>
      </div>
    );
  }

  return (
    <div className="card flex flex-col items-center justify-center p-3">
      <span className="text-2xl">{weather.icon}</span>
      <p className="text-lg font-bold text-foreground">{weather.temperature}°F</p>
      <p className="text-xs text-foreground-tertiary">{weather.tempHigh}° / {weather.tempLow}°</p>
    </div>
  );
}
