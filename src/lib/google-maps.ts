import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

// Track if options have been set
let optionsSet = false;

/**
 * Initialize the Google Maps loader options (only once)
 */
function initLoader(): void {
  if (optionsSet) return;

  setOptions({
    key: apiKey,
    v: 'weekly',
    libraries: ['places', 'marker'],
  });

  optionsSet = true;
}

/**
 * Check if Google Maps API key is configured
 */
export function isGoogleMapsConfigured(): boolean {
  return Boolean(apiKey && apiKey !== 'your-google-maps-api-key');
}

/**
 * Load the Google Maps API
 * Returns the google.maps namespace
 */
export async function loadGoogleMaps(): Promise<typeof google.maps | null> {
  if (!isGoogleMapsConfigured()) {
    console.warn('[Maps] Google Maps API key not configured');
    return null;
  }

  try {
    initLoader();
    // Load both maps and marker libraries
    await importLibrary('maps');
    await importLibrary('marker');
    return google.maps;
  } catch (error) {
    console.error('[Maps] Failed to load Google Maps:', error);
    return null;
  }
}

/**
 * Import a specific Google Maps library
 */
export async function importMapsLibrary(
  library: 'maps' | 'marker' | 'places' | 'geometry' | 'visualization' | 'drawing' | 'routes'
) {
  if (!isGoogleMapsConfigured()) {
    return null;
  }

  try {
    initLoader();
    return await importLibrary(library);
  } catch (error) {
    console.error(`[Maps] Failed to load library ${library}:`, error);
    return null;
  }
}

// Japan region defaults
export const JAPAN_CENTER = { lat: 35.6762, lng: 139.6503 }; // Tokyo
export const JAPAN_BOUNDS = {
  north: 45.5,
  south: 24.0,
  west: 122.9,
  east: 153.9,
};

// Simple LatLng type (avoids dependency on google.maps being loaded)
export interface LatLngLiteral {
  lat: number;
  lng: number;
}

// City centers for the trip
export const CITY_CENTERS: Record<string, LatLngLiteral> = {
  Tokyo: { lat: 35.6762, lng: 139.6503 },
  Hakone: { lat: 35.2324, lng: 139.1069 },
  Kyoto: { lat: 35.0116, lng: 135.7681 },
  Osaka: { lat: 34.6937, lng: 135.5023 },
};

// Default map options for Japan (typed as partial to avoid google.maps dependency at module level)
export const DEFAULT_MAP_OPTIONS: Partial<google.maps.MapOptions> & { center: LatLngLiteral } = {
  center: JAPAN_CENTER,
  zoom: 12,
  minZoom: 5,
  maxZoom: 20,
  gestureHandling: 'greedy',
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  styles: [
    // Subtle styling - can be expanded later
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
};
