'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  loadGoogleMaps,
  isGoogleMapsConfigured,
  DEFAULT_MAP_OPTIONS,
} from '@/lib/google-maps';
import type { Restaurant } from '@/types/database';

interface RestaurantMapProps {
  restaurants: Restaurant[];
  selectedId: string | null;
  highlightedId: string | null;
  userLocation: { lat: number; lng: number } | null;
  onPinClick: (restaurant: Restaurant) => void;
}

/**
 * Get theme-aware color from CSS variable
 */
function getThemeColor(cssVar: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
  return value || fallback;
}

/**
 * Create a pin element for a restaurant
 */
function createPinElement(
  restaurant: Restaurant,
  isSelected: boolean,
  isHighlighted: boolean
): HTMLDivElement {
  const pinElement = document.createElement('div');
  const foodColor = getThemeColor('--category-food', '#F46B55');
  const selectedScale = isSelected || isHighlighted ? 'scale(1.2)' : 'scale(1)';
  const borderWidth = isSelected ? '3px' : '2px';
  const shadowIntensity = isSelected || isHighlighted ? '0.5' : '0.3';

  pinElement.innerHTML = `
    <div style="
      background-color: ${foodColor};
      width: 36px;
      height: 36px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg) ${selectedScale};
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,${shadowIntensity});
      border: ${borderWidth} solid white;
      transition: transform 0.2s ease;
    ">
      <span style="
        transform: rotate(45deg);
        font-size: 16px;
      ">🍜</span>
    </div>
  `;

  return pinElement;
}

export function RestaurantMap({
  restaurants,
  selectedId,
  highlightedId,
  userLocation,
  onPinClick,
}: RestaurantMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.marker.AdvancedMarkerElement>>(
    new Map()
  );
  const userMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConfigured = isGoogleMapsConfigured();

  // Calculate center from restaurants
  const getMapCenter = useCallback(() => {
    const validRestaurants = restaurants.filter(
      (r) => r.locationLat != null && r.locationLng != null
    );

    if (validRestaurants.length === 0) {
      return DEFAULT_MAP_OPTIONS.center!;
    }

    // Calculate center of all restaurants
    const sumLat = validRestaurants.reduce((sum, r) => sum + (r.locationLat ?? 0), 0);
    const sumLng = validRestaurants.reduce((sum, r) => sum + (r.locationLng ?? 0), 0);

    return {
      lat: sumLat / validRestaurants.length,
      lng: sumLng / validRestaurants.length,
    };
  }, [restaurants]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || !isConfigured) return;

    const initMap = async () => {
      try {
        const maps = await loadGoogleMaps();
        if (!maps || !mapRef.current) return;

        const mapCenter = getMapCenter();

        mapInstanceRef.current = new maps.Map(mapRef.current, {
          ...DEFAULT_MAP_OPTIONS,
          center: mapCenter,
          zoom: 14,
          mapId: 'ftc-nihon-restaurants-map',
        });

        setIsLoaded(true);
      } catch (err) {
        console.error('[RestaurantMap] Init error:', err);
        setError('Failed to load map');
      }
    };

    initMap();
  }, [getMapCenter, isConfigured]);

  // Update restaurant pins
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;

    // Close any open info window
    infoWindowRef.current?.close();

    // Filter restaurants with valid coordinates
    const validRestaurants = restaurants.filter(
      (r) => r.locationLat != null && r.locationLng != null
    );

    // Track which markers to keep
    const currentIds = new Set(validRestaurants.map((r) => r.id));

    // Remove markers that are no longer in the list
    markersRef.current.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.map = null;
        markersRef.current.delete(id);
      }
    });

    // Create or update markers
    validRestaurants.forEach((restaurant) => {
      if (restaurant.locationLat == null || restaurant.locationLng == null) return;

      const isSelected = restaurant.id === selectedId;
      const isHighlighted = restaurant.id === highlightedId;

      const existingMarker = markersRef.current.get(restaurant.id);

      if (existingMarker) {
        // Update existing marker's content
        existingMarker.content = createPinElement(restaurant, isSelected, isHighlighted);
      } else {
        // Create new marker
        const pinElement = createPinElement(restaurant, isSelected, isHighlighted);

        const marker = new google.maps.marker.AdvancedMarkerElement({
          map: mapInstanceRef.current!,
          position: { lat: restaurant.locationLat, lng: restaurant.locationLng },
          content: pinElement,
          title: restaurant.name,
        });

        // Click handler
        marker.addListener('click', () => {
          onPinClick(restaurant);

          // Show info window
          if (!infoWindowRef.current) {
            infoWindowRef.current = new google.maps.InfoWindow();
          }

          const textSecondary = getThemeColor('--foreground-secondary', '#666');
          const textTertiary = getThemeColor('--foreground-tertiary', '#888');
          const bgColor = getThemeColor('--background', '#fff');
          const textColor = getThemeColor('--foreground', '#1a1a1a');

          infoWindowRef.current.setContent(`
            <div style="padding: 8px; max-width: 200px; background-color: ${bgColor};">
              <div style="font-weight: 600; margin-bottom: 4px; color: ${textColor};">${restaurant.name}</div>
              ${restaurant.type ? `<div style="font-size: 12px; color: ${textSecondary};">${restaurant.type}</div>` : ''}
              ${restaurant.priceRange ? `<div style="font-size: 12px; color: ${textTertiary};">${restaurant.priceRange}</div>` : ''}
            </div>
          `);

          infoWindowRef.current.open({
            anchor: marker,
            map: mapInstanceRef.current!,
          });
        });

        markersRef.current.set(restaurant.id, marker);
      }
    });

    // Fit bounds to show all markers
    if (validRestaurants.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      validRestaurants.forEach((r) => {
        if (r.locationLat != null && r.locationLng != null) {
          bounds.extend({ lat: r.locationLat, lng: r.locationLng });
        }
      });

      // Include user location in bounds if available
      if (userLocation) {
        bounds.extend(userLocation);
      }

      mapInstanceRef.current.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });
    }
  }, [isLoaded, restaurants, selectedId, highlightedId, userLocation, onPinClick]);

  // Update user location marker
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;

    // Remove existing user marker
    if (userMarkerRef.current) {
      userMarkerRef.current.map = null;
      userMarkerRef.current = null;
    }

    if (!userLocation) return;

    // Create user location marker
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

  // Error state
  const displayError = !isConfigured ? 'Google Maps API key not configured' : error;
  if (displayError) {
    return (
      <div className="flex h-full items-center justify-center bg-background-secondary">
        <div className="text-center p-4">
          <span className="text-4xl">🗺️</span>
          <p className="mt-2 text-foreground-secondary">{displayError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="h-full w-full" />

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
