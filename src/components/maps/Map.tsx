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
  /** Custom center override */
  center?: { lat: number; lng: number };
  /** Custom zoom override */
  zoom?: number;
  /** Additional CSS classes */
  className?: string;
}

// Category colors matching our design system
const CATEGORY_COLORS: Record<ActivityCategory, string> = {
  food: '#F46B55',
  temple: '#7C3AED',
  shopping: '#F5B800',
  transit: '#2563EB',
  activity: '#059669',
  hotel: '#8B5CF6',
};

// Category icons (using simpler glyphs for markers)
const CATEGORY_GLYPHS: Record<ActivityCategory, string> = {
  food: '🍜',
  temple: '⛩️',
  shopping: '🛍️',
  transit: '🚃',
  activity: '🎯',
  hotel: '🏨',
};

export function Map({
  activities = [],
  dayNumber,
  userLocation,
  onPinClick,
  center,
  zoom,
  className = '',
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const userMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine map center based on day or override
  const getMapCenter = useCallback(() => {
    if (center) return center;
    if (dayNumber) {
      const city = DAY_CITIES[dayNumber];
      if (city && CITY_CENTERS[city]) {
        return CITY_CENTERS[city];
      }
    }
    return DEFAULT_MAP_OPTIONS.center!;
  }, [center, dayNumber]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;
    if (!isGoogleMapsConfigured()) {
      setError('Google Maps API key not configured');
      return;
    }

    const initMap = async () => {
      try {
        const maps = await loadGoogleMaps();
        if (!maps || !mapRef.current) return;

        const mapCenter = getMapCenter();

        mapInstanceRef.current = new maps.Map(mapRef.current, {
          ...DEFAULT_MAP_OPTIONS,
          center: mapCenter,
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
  }, [getMapCenter, zoom]);

  // Update activity pins
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      marker.map = null;
    });
    markersRef.current = [];

    // Close any open info window
    infoWindowRef.current?.close();

    // Filter activities with valid coordinates
    const validActivities = activities.filter(
      (a) => a.locationLat != null && a.locationLng != null
    );

    // Create markers
    validActivities.forEach((activity) => {
      if (activity.locationLat == null || activity.locationLng == null) return;

      // Create custom pin element
      const pinElement = document.createElement('div');
      pinElement.className = 'ftc-map-pin';
      pinElement.innerHTML = `
        <div style="
          background-color: ${CATEGORY_COLORS[activity.category]};
          width: 36px;
          height: 36px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          border: 2px solid white;
        ">
          <span style="
            transform: rotate(45deg);
            font-size: 16px;
          ">${CATEGORY_GLYPHS[activity.category]}</span>
        </div>
      `;

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map: mapInstanceRef.current!,
        position: { lat: activity.locationLat, lng: activity.locationLng },
        content: pinElement,
        title: activity.name,
      });

      // Click handler
      marker.addListener('click', () => {
        onPinClick?.(activity);

        // Show info window
        if (!infoWindowRef.current) {
          infoWindowRef.current = new google.maps.InfoWindow();
        }

        infoWindowRef.current.setContent(`
          <div style="padding: 8px; max-width: 200px;">
            <div style="font-weight: 600; margin-bottom: 4px;">${activity.name}</div>
            <div style="font-size: 12px; color: #666;">${activity.startTime}</div>
            ${activity.locationName ? `<div style="font-size: 12px; color: #888;">${activity.locationName}</div>` : ''}
          </div>
        `);

        infoWindowRef.current.open({
          anchor: marker,
          map: mapInstanceRef.current!,
        });
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers if we have multiple
    if (markersRef.current.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      validActivities.forEach((a) => {
        if (a.locationLat != null && a.locationLng != null) {
          bounds.extend({ lat: a.locationLat, lng: a.locationLng });
        }
      });
      mapInstanceRef.current.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
    }
  }, [isLoaded, activities, onPinClick]);

  // Update user location marker
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;

    // Remove existing user marker
    if (userMarkerRef.current) {
      userMarkerRef.current.map = null;
      userMarkerRef.current = null;
    }

    if (!userLocation) return;

    // Create blue dot marker for user location
    const userPinElement = document.createElement('div');
    userPinElement.innerHTML = `
      <div style="
        width: 20px;
        height: 20px;
        background-color: #4285F4;
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

  // Error state
  if (error) {
    return (
      <div className={`flex items-center justify-center bg-background-secondary ${className}`}>
        <div className="text-center p-4">
          <span className="text-4xl">🗺️</span>
          <p className="mt-2 text-foreground-secondary">{error}</p>
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
