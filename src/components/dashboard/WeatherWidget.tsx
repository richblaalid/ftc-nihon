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
 * Compact weather widget for 2-column layout
 * Shows city, icon, temperature, condition, high/low, and rain chance
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
      <div className="card p-3 animate-pulse">
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-background-secondary" />
            <div className="h-6 w-12 rounded bg-background-secondary" />
          </div>
          <div className="text-right">
            <div className="h-4 w-16 rounded bg-background-secondary" />
            <div className="mt-1 h-3 w-12 rounded bg-background-secondary ml-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="card p-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌡️</span>
            <span className="text-xl font-bold text-foreground">--°</span>
          </div>
          <div className="text-right">
            <p className="text-sm text-foreground-secondary">{city}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-3">
      {/* Top row: Icon + temp on left, city + condition on right */}
      <div className="flex justify-evenly items-start">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{weather.icon}</span>
          <span className="text-2xl font-bold text-foreground">{weather.temperature}°</span>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-foreground-secondary">{weather.city}</p>
          <p className="text-xs text-foreground-tertiary">{weather.condition}</p>
        </div>
      </div>
      {/* Bottom row: High/Low on left, rain chance on right */}
      <div className="flex justify-evenly items-center mt-2 text-xs text-foreground-tertiary">
        <span>H: {weather.tempHigh}° L: {weather.tempLow}°</span>
        <span>🌧️ {weather.precipitationChance}%</span>
      </div>
    </div>
  );
}
