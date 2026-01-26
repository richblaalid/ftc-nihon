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
    <div className="card flex items-center gap-4">
      {/* Weather icon */}
      <span className="text-4xl">{weather.icon}</span>

      {/* Temperature and condition */}
      <div className="flex-1">
        <p className="text-sm text-foreground-tertiary">{weather.city}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold text-foreground">{weather.temperature}°C</span>
          <span className="text-sm text-foreground-secondary">{weather.condition}</span>
        </div>
      </div>

      {/* Humidity */}
      <div className="text-right">
        <p className="text-xs text-foreground-tertiary">Humidity</p>
        <p className="text-sm font-medium text-foreground-secondary">{weather.humidity}%</p>
      </div>
    </div>
  );
}
