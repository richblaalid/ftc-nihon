'use client';

import { useState, useCallback, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Map, PinLegend, PinInfo, Directions } from '@/components/maps';
import { DayStrip, PageHeader } from '@/components/ui';
import { useGeolocation } from '@/lib/hooks/useGeolocation';
import { useActivitiesWithTransit, useCurrentDayNumber, useAccommodationsForDay } from '@/db/hooks';
import { useAppStore } from '@/stores/app-store';
import type { ActivityWithTransit, Accommodation } from '@/types/database';

function MapContent() {
  const searchParams = useSearchParams();
  const dayParam = searchParams.get('day');

  // Global day selection from store
  const globalSelectedDay = useAppStore((state) => state.selectedDay);

  // Default to current trip day or day 1
  const currentTripDay = useCurrentDayNumber();

  // On mount only, check URL param and sync to store if present
  useEffect(() => {
    if (dayParam) {
      const day = parseInt(dayParam, 10);
      if (day >= 0 && day <= 15) {
        useAppStore.getState().setSelectedDay(day);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Only run on mount/URL change, not on store changes
  }, [dayParam]);

  // Effective day: store value takes precedence, otherwise current day, otherwise day 1
  const selectedDay = globalSelectedDay ?? currentTripDay ?? 1;

  const [selectedActivity, setSelectedActivity] = useState<ActivityWithTransit | null>(null);
  const [showDirections, setShowDirections] = useState(false);

  // Get user location
  const { lat, lng, isTracking, startTracking, error: geoError } = useGeolocation();
  const userLocation = lat && lng ? { lat, lng } : null;

  // Load activities for selected day using the hook
  const activitiesWithTransit = useActivitiesWithTransit(selectedDay);

  // Load accommodations for this day (last night's hotel and tonight's hotel)
  const accommodations = useAccommodationsForDay(selectedDay);

  // Convert accommodation to activity-like object for map display
  const accommodationToActivity = (acc: Accommodation, label: string): ActivityWithTransit => ({
    id: `hotel-${acc.id}`,
    dayNumber: selectedDay,
    date: acc.startDate,
    startTime: acc.checkInTime ?? '15:00',
    durationMinutes: null,
    name: `${label}: ${acc.name}`,
    category: 'hotel',
    locationName: acc.name,
    locationAddress: acc.address,
    locationAddressJp: acc.addressJp,
    locationLat: acc.locationLat,
    locationLng: acc.locationLng,
    googleMapsUrl: acc.googleMapsUrl,
    websiteUrl: null,
    description: acc.instructions,
    tips: acc.pinCode ? `Pin: ${acc.pinCode}` : null,
    whatToOrder: null,
    backupAlternative: null,
    isHardDeadline: false,
    isKidFriendly: true,
    sortOrder: 0,
    createdAt: acc.createdAt,
    updatedAt: acc.updatedAt,
    transit: null,
  });

  // Flatten transit data for components that expect it
  const dayActivities = activitiesWithTransit?.map((a) => ({
    ...a,
    leaveBy: a.transit?.leaveBy,
    walkToStationMinutes: a.transit?.walkToStationMinutes,
    stationName: a.transit?.stationName,
    trainLine: a.transit?.trainLine,
    suggestedDeparture: a.transit?.suggestedDeparture,
    travelMinutes: a.transit?.travelMinutes,
    transfers: a.transit?.transfers,
    arrivalStation: a.transit?.arrivalStation,
    walkToDestinationMinutes: a.transit?.walkToDestinationMinutes,
    bufferMinutes: a.transit?.bufferMinutes,
    transitSteps: a.transit?.steps,
  })) ?? [];

  // Combine activities with hotel markers
  const hotelMarkers: ActivityWithTransit[] = [];
  if (accommodations?.lastNight && accommodations.lastNight.locationLat && accommodations.lastNight.locationLng) {
    // Only add if different from tonight's hotel
    if (!accommodations.tonight || accommodations.lastNight.id !== accommodations.tonight.id) {
      hotelMarkers.push(accommodationToActivity(accommodations.lastNight, 'Last Night'));
    }
  }
  if (accommodations?.tonight && accommodations.tonight.locationLat && accommodations.tonight.locationLng) {
    hotelMarkers.push(accommodationToActivity(accommodations.tonight, 'Tonight'));
  }

  const activities = [...dayActivities, ...hotelMarkers];

  // Handle pin click
  const handlePinClick = useCallback((activity: ActivityWithTransit) => {
    setSelectedActivity(activity);
    setShowDirections(false);
  }, []);

  // Handle navigate to directions
  const handleNavigate = useCallback(() => {
    setShowDirections(true);
  }, []);

  // Handle close info/directions
  const handleClose = useCallback(() => {
    setSelectedActivity(null);
    setShowDirections(false);
  }, []);

  // Change day
  const handleDayChange = (newDay: number) => {
    useAppStore.getState().setSelectedDay(newDay);
    setSelectedActivity(null);
    setShowDirections(false);
  };

  return (
    <div className="flex flex-col bg-background overflow-hidden" style={{ height: 'calc(100dvh - 4rem - env(safe-area-inset-bottom))' }}>
      {/* Header */}
      <PageHeader
        title={`Day ${selectedDay} Map`}
        rightAction={
          <button
            onClick={() => !isTracking && startTracking()}
            aria-label={isTracking ? 'Location tracking enabled' : 'Enable location tracking'}
            className={`p-2 rounded-lg transition-colors ${isTracking ? 'bg-primary/10 text-primary' : 'bg-background-secondary text-foreground-secondary hover:bg-background-tertiary'}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        }
      >
        {/* Day strip navigation */}
        <div className="-mx-0">
          <DayStrip
            selectedDay={selectedDay}
            currentDay={currentTripDay}
            onDayChange={handleDayChange}
          />
        </div>
      </PageHeader>

      {/* Map container - takes remaining space */}
      <div className="flex-1 relative min-h-0 overflow-hidden">
        <div className="absolute inset-0">
          <Map
            activities={activities}
            dayNumber={selectedDay}
            userLocation={userLocation}
            onPinClick={handlePinClick}
            className="h-full w-full"
          />
        </div>

        {/* Legend - positioned bottom-left to avoid map controls */}
        <div
          className="absolute left-2 z-10 bg-background/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-border"
          style={{ bottom: '0.5rem', maxWidth: 'calc(100% - 5rem)' }}
        >
          <PinLegend />
        </div>

        {/* Selected activity info */}
        {selectedActivity && !showDirections && (
          <div className="absolute top-4 left-4 right-4 z-10">
            <PinInfo
              activity={selectedActivity}
              onClose={handleClose}
              onNavigate={handleNavigate}
            />
          </div>
        )}

        {/* Directions panel */}
        {selectedActivity && showDirections && (
          <div className="absolute top-4 left-4 right-4 z-10 max-h-[60vh] overflow-y-auto">
            <Directions
              activity={selectedActivity}
              userLocation={userLocation}
              onClose={handleClose}
            />
          </div>
        )}

        {/* Geolocation error */}
        {geoError && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-error text-white px-4 py-2 rounded-lg text-sm shadow-lg">
            {geoError}
          </div>
        )}
      </div>
    </div>
  );
}

function MapLoading() {
  return (
    <div className="flex flex-col bg-background overflow-hidden" style={{ height: 'calc(100dvh - 4rem - env(safe-area-inset-bottom))' }}>
      <header className="flex-shrink-0 px-4 py-3 bg-background border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-background-secondary rounded-lg animate-pulse" />
          <div className="w-32 h-6 bg-background-secondary rounded animate-pulse" />
        </div>
        {/* Day strip skeleton */}
        <div className="mt-2 -mx-4 flex gap-2 overflow-hidden px-4 py-2">
          <div className="h-5 w-12 animate-pulse rounded-full bg-background-secondary" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 w-11 animate-pulse rounded-xl bg-background-secondary" />
          ))}
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center bg-background-secondary min-h-0">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-2 text-sm text-foreground-secondary">Loading map...</p>
        </div>
      </div>
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense fallback={<MapLoading />}>
      <MapContent />
    </Suspense>
  );
}
