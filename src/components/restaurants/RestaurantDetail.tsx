'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import { loadGoogleMaps, isGoogleMapsConfigured } from '@/lib/google-maps';
import type { Restaurant } from '@/types/database';

interface RestaurantDetailProps {
  restaurant: Restaurant;
  isSelected: boolean;
  mealLabel: string;
  onSelect: () => Promise<void>;
}

/**
 * Detailed view of a restaurant with map, contact info, and selection
 */
/**
 * Simple mini-map component for single restaurant location
 */
function RestaurantMiniMap({ lat, lng, name }: { lat: number; lng: number; name: string }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isConfigured = isGoogleMapsConfigured();

  useEffect(() => {
    if (!mapRef.current || !isConfigured) return;

    const initMap = async () => {
      try {
        const maps = await loadGoogleMaps();
        if (!maps || !mapRef.current) return;

        const map = new maps.Map(mapRef.current, {
          center: { lat, lng },
          zoom: 16,
          mapId: 'ftc-nihon-restaurant-detail',
          disableDefaultUI: true,
          zoomControl: false,
          gestureHandling: 'none', // Static for detail view
        });

        // Add marker for the restaurant
        const pinElement = document.createElement('div');
        pinElement.innerHTML = `
          <div style="
            background-color: #F46B55;
            width: 36px;
            height: 36px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            border: 2px solid white;
          ">
            <span style="transform: rotate(45deg); font-size: 16px;">🍜</span>
          </div>
        `;

        new google.maps.marker.AdvancedMarkerElement({
          map,
          position: { lat, lng },
          content: pinElement,
          title: name,
        });

        setIsLoaded(true);
      } catch (err) {
        console.error('[RestaurantMiniMap] Init error:', err);
        setError('Failed to load map');
      }
    };

    initMap();
  }, [lat, lng, name, isConfigured]);

  if (!isConfigured || error) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-background-secondary">
        <span className="text-4xl">🗺️</span>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="h-full w-full" />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background-secondary">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
    </div>
  );
}

export function RestaurantDetail({
  restaurant,
  isSelected,
  mealLabel,
  onSelect,
}: RestaurantDetailProps) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const handleSelect = useCallback(async () => {
    setIsSelecting(true);
    try {
      await onSelect();
    } finally {
      setIsSelecting(false);
    }
  }, [onSelect]);

  const handleCopyAddress = useCallback(async () => {
    const address = restaurant.addressJapanese || restaurant.address;
    if (!address) return;

    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  }, [restaurant.addressJapanese, restaurant.address]);

  const hasCoordinates = restaurant.locationLat != null && restaurant.locationLng != null;
  const googleMapsUrl =
    restaurant.googleMapsUrl ||
    (hasCoordinates
      ? `https://www.google.com/maps/search/?api=1&query=${restaurant.locationLat},${restaurant.locationLng}`
      : null);

  return (
    <div className="space-y-4">
      {/* Map section */}
      {hasCoordinates && (
        <div className="relative h-48 rounded-xl overflow-hidden bg-background-secondary">
          <RestaurantMiniMap
            lat={restaurant.locationLat!}
            lng={restaurant.locationLng!}
            name={restaurant.name}
          />

          {/* Open in Maps button */}
          {googleMapsUrl && (
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-3 right-3 flex items-center gap-2 rounded-lg bg-background/95 px-3 py-2 text-sm font-medium text-foreground shadow-lg backdrop-blur-sm"
            >
              <span>Open in Maps</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          )}
        </div>
      )}

      {/* Restaurant info card */}
      <div className="card space-y-4">
        {/* Name section */}
        <div>
          <h2 className="text-xl font-semibold text-foreground">{restaurant.name}</h2>
          {restaurant.nameJapanese && (
            <p className="mt-1 text-foreground-secondary">{restaurant.nameJapanese}</p>
          )}
        </div>

        {/* Type and price */}
        <div className="flex flex-wrap gap-2">
          {restaurant.type && (
            <span className="rounded-full bg-category-food/10 px-3 py-1 text-sm font-medium text-category-food">
              {restaurant.type}
            </span>
          )}
          {restaurant.priceRange && (
            <span className="rounded-full bg-background-secondary px-3 py-1 text-sm text-foreground-secondary">
              {restaurant.priceRange}
            </span>
          )}
          {restaurant.isKidFriendly && (
            <span className="rounded-full bg-success/10 px-3 py-1 text-sm font-medium text-success">
              Kid-friendly
            </span>
          )}
        </div>

        {/* Details list */}
        <dl className="space-y-3 text-sm">
          {/* Hours */}
          {restaurant.hours && (
            <div className="flex items-start gap-3">
              <dt className="text-foreground-tertiary">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </dt>
              <dd className="text-foreground">{restaurant.hours}</dd>
            </div>
          )}

          {/* Address */}
          {(restaurant.address || restaurant.addressJapanese) && (
            <div className="flex items-start gap-3">
              <dt className="text-foreground-tertiary">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </dt>
              <dd className="flex-1">
                <p className="text-foreground">{restaurant.address}</p>
                {restaurant.addressJapanese && restaurant.addressJapanese !== restaurant.address && (
                  <p className="mt-0.5 text-foreground-secondary">{restaurant.addressJapanese}</p>
                )}
                <button
                  onClick={handleCopyAddress}
                  className="mt-1 text-xs text-primary"
                >
                  {copiedAddress ? 'Copied!' : 'Copy Japanese address'}
                </button>
              </dd>
            </div>
          )}

          {/* Nearest station */}
          {restaurant.nearestStation && (
            <div className="flex items-start gap-3">
              <dt className="text-foreground-tertiary">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
              </dt>
              <dd className="text-foreground">Near {restaurant.nearestStation}</dd>
            </div>
          )}

          {/* Phone */}
          {restaurant.phone && (
            <div className="flex items-start gap-3">
              <dt className="text-foreground-tertiary">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </dt>
              <dd>
                <a
                  href={`tel:${restaurant.phone}`}
                  className="text-primary underline"
                >
                  {restaurant.phone}
                </a>
              </dd>
            </div>
          )}
        </dl>

        {/* What to order */}
        {restaurant.whatToOrder && (
          <div className="rounded-lg bg-amber-50 dark:bg-amber-500/10 p-3">
            <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">
              What to order
            </h3>
            <p className="mt-1 text-sm text-amber-700 dark:text-amber-200">
              {restaurant.whatToOrder}
            </p>
          </div>
        )}

        {/* Notes */}
        {restaurant.notes && (
          <div className="rounded-lg bg-background-secondary p-3">
            <h3 className="text-sm font-medium text-foreground-secondary">Notes</h3>
            <p className="mt-1 text-sm text-foreground">{restaurant.notes}</p>
          </div>
        )}
      </div>

      {/* Selection button */}
      <button
        onClick={handleSelect}
        disabled={isSelecting}
        className={`w-full rounded-xl py-3 px-4 text-center font-semibold transition-colors ${
          isSelected
            ? 'bg-background-secondary text-foreground border border-border'
            : 'bg-primary text-white'
        } ${isSelecting ? 'opacity-70 cursor-wait' : ''}`}
      >
        {isSelecting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Saving...
          </span>
        ) : isSelected ? (
          <span className="flex items-center justify-center gap-2">
            <span>✓</span>
            <span>Selected for {mealLabel}</span>
          </span>
        ) : (
          <span>Select for {mealLabel}</span>
        )}
      </button>
    </div>
  );
}
