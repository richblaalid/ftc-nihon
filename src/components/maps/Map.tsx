'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  loadGoogleMaps,
  isGoogleMapsConfigured,
  DEFAULT_MAP_OPTIONS,
  CITY_CENTERS,
} from '@/lib/google-maps';
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
 * Create a pin DOM element for a marker
 */
function createPinElement(
  category: ActivityCategory,
  isSelected: boolean
): HTMLDivElement {
  const pinSize = isSelected ? 48 : 36;
  const iconSize = isSelected ? 20 : 16;
  const borderWidth = isSelected ? 3 : 2;
  const pinColor = getCategoryColor(category);

  const pinElement = document.createElement('div');
  pinElement.className = 'ftc-map-pin';
  pinElement.innerHTML = `
    <div style="
      background-color: ${pinColor};
      width: ${pinSize}px;
      height: ${pinSize}px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: ${isSelected ? '0 4px 12px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.3)'};
      border: ${borderWidth}px solid white;
      transition: all 0.15s ease-out;
    ">
      <span style="
        transform: rotate(45deg);
        font-size: ${iconSize}px;
      ">${CATEGORY_GLYPHS[category]}</span>
    </div>
  `;
  return pinElement;
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

  // Check config once (not in effect)
  const isConfigured = isGoogleMapsConfigured();

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

        mapInstanceRef.current = new maps.Map(mapRef.current, {
          ...DEFAULT_MAP_OPTIONS,
          center: initialCenter,
          zoom: zoom ?? 13,
          mapId: 'ftc-nihon-map', // Required for advanced markers
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
    validActivities.forEach((activity) => {
      if (activity.locationLat == null || activity.locationLng == null) return;

      const pinElement = createPinElement(activity.category, false);

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map: mapInstanceRef.current!,
        position: { lat: activity.locationLat, lng: activity.locationLng },
        content: pinElement,
        title: activity.name,
        zIndex: 1,
      });

      // Click handler - just notify parent, custom PinInfo handles display
      marker.addListener('click', () => {
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
        prevMarker.content = createPinElement(prevActivity.category, false);
        prevMarker.zIndex = 1;
      }
    }

    // Update new selection to selected state
    if (newId && newActivity) {
      const newMarker = markersRef.current.get(newId);
      if (newMarker) {
        newMarker.content = createPinElement(newActivity.category, true);
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

    // Create user location marker with theme-aware primary color
    const primaryColor = getThemeColor('--primary', '#4285F4');
    const userPinElement = document.createElement('div');
    userPinElement.innerHTML = `
      <div style="
        width: 20px;
        height: 20px;
        background-color: ${primaryColor};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      "></div>
    `;

    userMarkerRef.current = new google.maps.marker.AdvancedMarkerElement({
      map: mapInstanceRef.current,
      position: userLocation,
      content: userPinElement,
      title: 'Your location',
    });
  }, [isLoaded, userLocation]);

  // Error state (config error or runtime error)
  const displayError = !isConfigured ? 'Google Maps API key not configured' : error;
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
