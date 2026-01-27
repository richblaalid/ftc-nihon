'use client';

import { useState, useCallback, Suspense, useTransition, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Map, PinLegend, PinInfo, Directions } from '@/components/maps';
import { DayStrip } from '@/components/ui';
import { useGeolocation } from '@/lib/hooks/useGeolocation';
import { useActivitiesWithTransit, useCurrentDayNumber } from '@/db/hooks';
import { useAppStore } from '@/stores/app-store';
import type { ActivityWithTransit } from '@/types/database';
import Link from 'next/link';

function MapContent() {
  const searchParams = useSearchParams();
  const dayParam = searchParams.get('day');

  // Global day selection from store
  const globalSelectedDay = useAppStore((state) => state.selectedDay);
  const setGlobalSelectedDay = useAppStore((state) => state.setSelectedDay);

  // Default to current trip day or day 1
  const currentTripDay = useCurrentDayNumber();

  // On mount, check URL param and sync to store if present
  useEffect(() => {
    if (dayParam) {
      const day = parseInt(dayParam, 10);
      if (day >= 1 && day <= 15 && day !== globalSelectedDay) {
        setGlobalSelectedDay(day);
      }
    }
  }, [dayParam, globalSelectedDay, setGlobalSelectedDay]);

  // Effective day: store value takes precedence, otherwise current day, otherwise day 1
  const selectedDay = globalSelectedDay ?? currentTripDay ?? 1;

  const [selectedActivity, setSelectedActivity] = useState<ActivityWithTransit | null>(null);
  const [showDirections, setShowDirections] = useState(false);
  const [isPending, startTransition] = useTransition();

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

  // Change day with non-blocking transition
  const handleDayChange = (newDay: number) => {
    startTransition(() => {
      setGlobalSelectedDay(newDay);
      setSelectedActivity(null);
      setShowDirections(false);
    });
  };

  return (
    <>
      <div className="flex flex-col bg-background" style={{ height: 'calc(100dvh - 4rem)' }}>
        {/* Header */}
        <header className="flex-shrink-0 px-4 py-3 bg-background border-b border-border safe-area-top">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" aria-label="Back to home" className="p-2 -ml-2 rounded-lg hover:bg-background-secondary">
                <svg className="w-5 h-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-lg font-semibold text-foreground">Day {selectedDay} Map</h1>
            </div>

            {/* Location toggle */}
            <button
              onClick={() => !isTracking && startTracking()}
              aria-label={isTracking ? 'Location tracking enabled' : 'Enable location tracking'}
              className={`p-2 rounded-lg ${isTracking ? 'bg-primary/10 text-primary' : 'bg-background-secondary text-foreground-secondary'}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>

          {/* Day strip navigation */}
          <div className="mt-2 -mx-4">
            <DayStrip
              selectedDay={selectedDay}
              currentDay={currentTripDay}
              onDayChange={handleDayChange}
              isPending={isPending}
            />
          </div>
        </header>

        {/* Map */}
        <div className="flex-1 relative min-h-0">
          <Map
            activities={activities}
            dayNumber={selectedDay}
            userLocation={userLocation}
            onPinClick={handlePinClick}
            className="h-full w-full"
          />

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

      {/* Legend - fixed above bottom nav */}
      <div className="fixed bottom-16 left-2 right-2 z-40 bg-background/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-border">
        <PinLegend />
      </div>
    </>
  );
}

function MapLoading() {
  return (
    <div className="flex flex-col bg-background" style={{ height: 'calc(100dvh - 4rem)' }}>
      <header className="flex-shrink-0 px-4 py-3 bg-background border-b border-border safe-area-top">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-background-secondary rounded-lg animate-pulse" />
          <div className="w-32 h-6 bg-background-secondary rounded animate-pulse" />
        </div>
        {/* Day strip skeleton */}
        <div className="mt-2 -mx-4 flex gap-2 overflow-hidden px-4 py-2">
          <div className="h-5 w-12 animate-pulse rounded-full bg-background-secondary" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 w-11 animate-pulse rounded-xl bg-background-secondary" />
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
