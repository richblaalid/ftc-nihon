'use client';

import { useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Map, PinLegend, PinInfo, Directions } from '@/components/maps';
import { useGeolocation } from '@/lib/hooks/useGeolocation';
import { useActivitiesWithTransit, useCurrentDayNumber } from '@/db/hooks';
import type { ActivityWithTransit } from '@/types/database';
import Link from 'next/link';

function MapContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dayParam = searchParams.get('day');

  // Default to current trip day or day 1
  const currentTripDay = useCurrentDayNumber();
  const selectedDay = dayParam ? parseInt(dayParam, 10) : (currentTripDay || 1);

  const [selectedActivity, setSelectedActivity] = useState<ActivityWithTransit | null>(null);
  const [showDirections, setShowDirections] = useState(false);

  // Get user location
  const { lat, lng, isTracking, startTracking, error: geoError } = useGeolocation();
  const userLocation = lat && lng ? { lat, lng } : null;

  // Load activities for selected day using the hook
  const activitiesWithTransit = useActivitiesWithTransit(selectedDay);

  // Flatten transit data for components that expect it
  const activities = activitiesWithTransit?.map((a) => ({
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
    router.push(`/map?day=${newDay}`);
    setSelectedActivity(null);
    setShowDirections(false);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex-shrink-0 px-4 py-3 bg-background border-b border-border safe-area-top">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 -ml-2 rounded-lg hover:bg-background-secondary">
              <svg className="w-5 h-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-lg font-semibold text-foreground">Day {selectedDay} Map</h1>
          </div>

          {/* Location toggle */}
          <button
            onClick={() => !isTracking && startTracking()}
            className={`p-2 rounded-lg ${isTracking ? 'bg-primary/10 text-primary' : 'bg-background-secondary text-foreground-secondary'}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        {/* Day selector */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
          {Array.from({ length: 15 }, (_, i) => i + 1).map((day) => (
            <button
              key={day}
              onClick={() => handleDayChange(day)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                ${day === selectedDay
                  ? 'bg-primary text-white'
                  : 'bg-background-secondary text-foreground-secondary hover:bg-background-tertiary'
                }`}
            >
              Day {day}
            </button>
          ))}
        </div>
      </header>

      {/* Map */}
      <div className="flex-1 relative">
        <Map
          activities={activities}
          dayNumber={selectedDay}
          userLocation={userLocation}
          onPinClick={handlePinClick}
          className="h-full w-full"
        />

        {/* Legend */}
        <div className="absolute bottom-4 left-4 right-4 bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-border">
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
    <div className="h-screen flex flex-col bg-background">
      <header className="flex-shrink-0 px-4 py-3 bg-background border-b border-border safe-area-top">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-background-secondary rounded-lg animate-pulse" />
          <div className="w-32 h-6 bg-background-secondary rounded animate-pulse" />
        </div>
        <div className="flex gap-2 mt-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-16 h-8 bg-background-secondary rounded-full animate-pulse" />
          ))}
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center bg-background-secondary">
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
