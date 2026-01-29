'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  loadGoogleMaps,
  isGoogleMapsConfigured,
  DEFAULT_MAP_OPTIONS,
  CITY_CENTERS,
} from '@/lib/google-maps';
import { useSyncStore } from '@/stores/sync-store';
import type { ActivityWithTransit, ActivityCategory } from '@/types/database';
import { DAY_CITIES } from '@/types/database';

interface MapProps {
  /** Activities to show as pins */
  activities?: ActivityWithTransit[];
  /** Current day number (1-15) for centering */
  dayNumber?: number;
  /** User's current location */
  userLocation?: { lat: number; lng: number } | null;
  /** Callback when a pin is clicked */
  onPinClick?: (activity: ActivityWithTransit) => void;
  /** ID of the currently selected activity (for highlighting) */
  selectedActivityId?: string | null;
  /** Custom center override */
  center?: { lat: number; lng: number };
  /** Custom zoom override */
  zoom?: number;
  /** Additional CSS classes */
  className?: string;
}

// Fallback category colors (used if CSS variables unavailable)
const CATEGORY_COLORS_FALLBACK: Record<ActivityCategory, string> = {
  food: '#F46B55',
  temple: '#7C3AED',
  shopping: '#F5B800',
  transit: '#2563EB',
  activity: '#059669',
  hotel: '#8B5CF6',
};

// CSS variable names for category colors
const CATEGORY_CSS_VARS: Record<ActivityCategory, string> = {
  food: '--category-food',
  temple: '--category-temple',
  shopping: '--category-shopping',
  transit: '--category-transit',
  activity: '--category-activity',
  hotel: '--category-hotel',
};

/**
 * Get category color from CSS variable (theme-aware) with fallback
 */
function getCategoryColor(category: ActivityCategory): string {
  if (typeof document === 'undefined') {
    return CATEGORY_COLORS_FALLBACK[category];
  }
  const cssVar = CATEGORY_CSS_VARS[category];
  const value = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
  return value || CATEGORY_COLORS_FALLBACK[category];
}

/**
 * Get theme-aware color from CSS variable
 */
function getThemeColor(cssVar: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
  return value || fallback;
}

// Category icons (using simpler glyphs for markers)
const CATEGORY_GLYPHS: Record<ActivityCategory, string> = {
  food: '🍜',
  temple: '⛩️',
  shopping: '🛍️',
  transit: '🚃',
  activity: '🎯',
  hotel: '🏨',
};

// Type for our marker map to avoid collision with google.maps.Map
type MarkerMap = globalThis.Map<string, google.maps.marker.AdvancedMarkerElement>;

/**
 * Create a PinElement with custom styling for a category
 */
function createPinElement(
  category: ActivityCategory,
  isSelected: boolean = false
): google.maps.marker.PinElement {
  const pinColor = getCategoryColor(category);
  const glyph = document.createElement('span');
  glyph.textContent = CATEGORY_GLYPHS[category];
  glyph.style.fontSize = isSelected ? '16px' : '14px';

  return new google.maps.marker.PinElement({
    background: pinColor,
    borderColor: 'white',
    glyphColor: 'white',
    glyph,
    scale: isSelected ? 1.3 : 1.0,
  });
}

/**
 * Create a user location marker element (blue dot)
 */
function createUserLocationElement(): HTMLElement {
  const primaryColor = getThemeColor('--primary', '#4285F4');
  const el = document.createElement('div');
  el.style.width = '20px';
  el.style.height = '20px';
  el.style.borderRadius = '50%';
  el.style.backgroundColor = primaryColor;
  el.style.border = '3px solid white';
  el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
  return el;
}

export function Map({
  activities = [],
  dayNumber,
  userLocation,
  onPinClick,
  selectedActivityId,
  center,
  zoom,
  className = '',
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  // Store markers by activity ID for easy lookup and updates
  const markersRef = useRef<MarkerMap>(new globalThis.Map());
  // Track previous activity IDs to detect actual data changes (not just reference changes)
  const prevActivityIdsRef = useRef<string>('');
  // Track previous selection for efficient updates
  const prevSelectedIdRef = useRef<string | null>(null);
  const userMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Track if we've mounted (for hydration-safe online check)
  const [isMounted, setIsMounted] = useState(false);

  // Check config once (not in effect)
  const isConfigured = isGoogleMapsConfigured();

  // Set mounted after hydration to avoid SSR mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Get initial map center based on day (used only for initialization)
  const getInitialCenter = useCallback(() => {
    if (dayNumber) {
      const city = DAY_CITIES[dayNumber];
      if (city && CITY_CENTERS[city]) {
        return CITY_CENTERS[city];
      }
    }
    return DEFAULT_MAP_OPTIONS.center!;
  }, [dayNumber]);

  // Initialize map (only once per day change, NOT when selection changes)
  useEffect(() => {
    if (!mapRef.current || !isConfigured) return;
    // Don't reinitialize if map already exists for this config
    if (mapInstanceRef.current) return;

    const initMap = async () => {
      try {
        const maps = await loadGoogleMaps();
        if (!maps || !mapRef.current) return;

        const initialCenter = getInitialCenter();

        // mapId: DEMO_MAP_ID is a special value that works without cloud configuration
        // See: https://developers.google.com/maps/documentation/javascript/reference/map
        const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID';

        mapInstanceRef.current = new maps.Map(mapRef.current, {
          ...DEFAULT_MAP_OPTIONS,
          center: initialCenter,
          zoom: zoom ?? 13,
          mapId,
        });

        setIsLoaded(true);
      } catch (err) {
        console.error('[Map] Init error:', err);
        setError('Failed to load map');
      }
    };

    initMap();
  }, [getInitialCenter, zoom, isConfigured]);

  // Pan to center when center prop changes (smooth animation)
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current || !center) return;

    const map = mapInstanceRef.current;
    const currentZoom = map.getZoom() ?? 13;

    // Smoothly pan to the new center
    map.panTo(center);

    // Only zoom in if current zoom is too far out (don't zoom out if user has zoomed in)
    if (currentZoom < 14) {
      // Small delay lets pan start before zoom for smoother feel
      setTimeout(() => {
        map.setZoom(15);
      }, 150);
    }
  }, [isLoaded, center]);

  // Update activity pins (only when activity data actually changes, not just reference)
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;

    // Filter activities with valid coordinates
    const validActivities = activities.filter(
      (a) => a.locationLat != null && a.locationLng != null
    );

    // Create a stable ID string to compare - only recreate markers if activities changed
    const currentActivityIds = validActivities.map(a => a.id).sort().join(',');
    if (currentActivityIds === prevActivityIdsRef.current) {
      // Activities haven't changed, don't recreate markers
      return;
    }
    prevActivityIdsRef.current = currentActivityIds;

    // Clear existing markers (only when activities actually changed)
    markersRef.current.forEach((marker) => {
      marker.map = null;
    });
    markersRef.current.clear();
    prevSelectedIdRef.current = null;

    // Create markers (all in unselected state initially)
    // Using AdvancedMarkerElement with PinElement for custom styling
    validActivities.forEach((activity) => {
      if (activity.locationLat == null || activity.locationLng == null) return;

      const pinElement = createPinElement(activity.category, false);

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map: mapInstanceRef.current!,
        position: { lat: activity.locationLat, lng: activity.locationLng },
        title: activity.name,
        content: pinElement.element,
        zIndex: 1,
      });

      // Click handler (gmp-click for AdvancedMarkerElement)
      marker.addListener('gmp-click', () => {
        onPinClick?.(activity);
      });

      // Store marker by activity ID
      markersRef.current.set(activity.id, marker);
    });

    // Fit bounds to show all markers if we have multiple AND no specific center is requested
    // (if center is provided, the pan-to-center effect handles positioning)
    if (markersRef.current.size > 1 && !center) {
      const bounds = new google.maps.LatLngBounds();
      validActivities.forEach((a) => {
        if (a.locationLat != null && a.locationLng != null) {
          bounds.extend({ lat: a.locationLat, lng: a.locationLng });
        }
      });
      mapInstanceRef.current.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
    }
  // Note: center is intentionally NOT a dependency - changing selection should not recreate markers
  // The separate pan-to-center effect handles centering on selected activity
  // eslint-disable-next-line react-hooks/exhaustive-deps -- center excluded per above comment
  }, [isLoaded, activities, onPinClick]);

  // Update marker styling when selection changes (efficient: only updates affected markers)
  useEffect(() => {
    if (!isLoaded) return;

    const prevId = prevSelectedIdRef.current;
    const newId = selectedActivityId ?? null;

    // No change in selection
    if (prevId === newId) return;

    // Find the activities for styling
    const prevActivity = prevId ? activities.find(a => a.id === prevId) : null;
    const newActivity = newId ? activities.find(a => a.id === newId) : null;

    // Update previous selection to unselected state
    if (prevId && prevActivity) {
      const prevMarker = markersRef.current.get(prevId);
      if (prevMarker) {
        const pinElement = createPinElement(prevActivity.category, false);
        prevMarker.content = pinElement.element;
        prevMarker.zIndex = 1;
      }
    }

    // Update new selection to selected state
    if (newId && newActivity) {
      const newMarker = markersRef.current.get(newId);
      if (newMarker) {
        const pinElement = createPinElement(newActivity.category, true);
        newMarker.content = pinElement.element;
        newMarker.zIndex = 100;
      }
    }

    // Track for next update
    prevSelectedIdRef.current = newId;
  }, [isLoaded, selectedActivityId, activities]);

  // Update user location marker
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;

    // Remove existing user marker
    if (userMarkerRef.current) {
      userMarkerRef.current.map = null;
      userMarkerRef.current = null;
    }

    if (!userLocation) return;

    // Create user location marker with custom HTML element (blue dot)
    userMarkerRef.current = new google.maps.marker.AdvancedMarkerElement({
      map: mapInstanceRef.current,
      position: userLocation,
      title: 'Your location',
      content: createUserLocationElement(),
      zIndex: 1000, // Above other markers
    });
  }, [isLoaded, userLocation]);

  // Check if offline (only after mount to avoid hydration mismatch)
  const isOnline = useSyncStore((state) => state.isOnline);

  // Error state (config error, runtime error, or offline)
  const displayError = !isConfigured ? 'Google Maps API key not configured' : error;

  // Show offline message if offline and map hasn't loaded
  // Only check after mount to avoid SSR hydration mismatch
  if (isMounted && !isOnline && !isLoaded) {
    return (
      <div className={`flex items-center justify-center bg-background-secondary ${className}`}>
        <div className="text-center p-4 max-w-xs">
          <span className="text-4xl">📍</span>
          <p className="mt-2 font-medium text-foreground">Map unavailable offline</p>
          <p className="mt-1 text-sm text-foreground-secondary">
            Google Maps requires an internet connection to load map tiles.
          </p>
          <p className="mt-3 text-xs text-foreground-tertiary">
            Your activity locations are still saved. Connect to the internet to view the map.
          </p>
        </div>
      </div>
    );
  }

  if (displayError) {
    return (
      <div className={`flex items-center justify-center bg-background-secondary ${className}`}>
        <div className="text-center p-4">
          <span className="text-4xl">🗺️</span>
          <p className="mt-2 text-foreground-secondary">{displayError}</p>
          <p className="mt-1 text-xs text-foreground-tertiary">
            Configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Map container */}
      <div ref={mapRef} className="h-full w-full" />

      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background-secondary">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="mt-2 text-sm text-foreground-secondary">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
}
