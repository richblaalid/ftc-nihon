export interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  city: string;
  updatedAt: string;
}

// Weather cache table in a simple format stored in localStorage
// (Keeping IndexedDB for main data, localStorage for simple cache)
const WEATHER_CACHE_KEY = 'ftc-weather-cache';
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Get cached weather data
 */
export function getCachedWeather(): WeatherData | null {
  if (typeof window === 'undefined') return null;

  try {
    const cached = localStorage.getItem(WEATHER_CACHE_KEY);
    if (!cached) return null;

    const data = JSON.parse(cached) as WeatherData & { cachedAt: number };

    // Return cached data regardless of age for offline support
    // The fetchWeather function will update it when online
    return {
      temperature: data.temperature,
      condition: data.condition,
      icon: data.icon,
      humidity: data.humidity,
      city: data.city,
      updatedAt: data.updatedAt,
    };
  } catch {
    return null;
  }
}

/**
 * Check if cache is fresh
 */
export function isCacheFresh(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const cached = localStorage.getItem(WEATHER_CACHE_KEY);
    if (!cached) return false;

    const data = JSON.parse(cached) as { cachedAt: number };
    return Date.now() - data.cachedAt < CACHE_DURATION_MS;
  } catch {
    return false;
  }
}

/**
 * Save weather data to cache
 */
function cacheWeather(data: WeatherData): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(
      WEATHER_CACHE_KEY,
      JSON.stringify({
        ...data,
        cachedAt: Date.now(),
      })
    );
  } catch {
    // localStorage might be full or disabled
  }
}

/**
 * Map Open-Meteo weather codes to conditions and icons
 */
function getWeatherCondition(code: number): { condition: string; icon: string } {
  // WMO Weather interpretation codes
  const conditions: Record<number, { condition: string; icon: string }> = {
    0: { condition: 'Clear', icon: '☀️' },
    1: { condition: 'Mostly Clear', icon: '🌤️' },
    2: { condition: 'Partly Cloudy', icon: '⛅' },
    3: { condition: 'Overcast', icon: '☁️' },
    45: { condition: 'Foggy', icon: '🌫️' },
    48: { condition: 'Foggy', icon: '🌫️' },
    51: { condition: 'Light Drizzle', icon: '🌧️' },
    53: { condition: 'Drizzle', icon: '🌧️' },
    55: { condition: 'Heavy Drizzle', icon: '🌧️' },
    61: { condition: 'Light Rain', icon: '🌧️' },
    63: { condition: 'Rain', icon: '🌧️' },
    65: { condition: 'Heavy Rain', icon: '🌧️' },
    71: { condition: 'Light Snow', icon: '🌨️' },
    73: { condition: 'Snow', icon: '🌨️' },
    75: { condition: 'Heavy Snow', icon: '🌨️' },
    80: { condition: 'Rain Showers', icon: '🌦️' },
    81: { condition: 'Rain Showers', icon: '🌦️' },
    82: { condition: 'Heavy Showers', icon: '⛈️' },
    95: { condition: 'Thunderstorm', icon: '⛈️' },
    96: { condition: 'Thunderstorm', icon: '⛈️' },
    99: { condition: 'Thunderstorm', icon: '⛈️' },
  };

  return conditions[code] ?? { condition: 'Unknown', icon: '🌡️' };
}

// City coordinates for Japan trip
const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  Tokyo: { lat: 35.6762, lon: 139.6503 },
  Hakone: { lat: 35.2324, lon: 139.1069 },
  Kyoto: { lat: 35.0116, lon: 135.7681 },
  Osaka: { lat: 34.6937, lon: 135.5023 },
};

/**
 * Fetch weather from Open-Meteo API (free, no API key required)
 */
export async function fetchWeather(city: string): Promise<WeatherData | null> {
  const coords = CITY_COORDS[city];
  if (!coords) {
    console.warn(`[Weather] Unknown city: ${city}`);
    return getCachedWeather();
  }

  // Check if cache is fresh
  if (isCacheFresh()) {
    const cached = getCachedWeather();
    if (cached && cached.city === city) {
      return cached;
    }
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=Asia/Tokyo`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    const current = data.current;

    const { condition, icon } = getWeatherCondition(current.weather_code);

    const weatherData: WeatherData = {
      temperature: Math.round(current.temperature_2m),
      condition,
      icon,
      humidity: current.relative_humidity_2m,
      city,
      updatedAt: new Date().toISOString(),
    };

    cacheWeather(weatherData);
    return weatherData;
  } catch (error) {
    console.error('[Weather] Fetch failed:', error);
    // Return cached data as fallback
    return getCachedWeather();
  }
}

/**
 * Get weather with offline fallback
 */
export async function getWeather(city: string): Promise<WeatherData | null> {
  // If offline, return cached data immediately
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return getCachedWeather();
  }

  return fetchWeather(city);
}
