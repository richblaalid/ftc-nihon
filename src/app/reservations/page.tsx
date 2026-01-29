'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAccommodations } from '@/db/hooks';
import { AccommodationCard } from '@/components/reservations';
import { PageHeader } from '@/components/ui';

/**
 * Inner content component that uses useSearchParams
 */
function ReservationsContent() {
  const searchParams = useSearchParams();
  const hotelParam = searchParams.get('hotel');
  const accommodations = useAccommodations();

  // Determine current accommodation based on today's date
  const getCurrentAccommodation = () => {
    if (!accommodations || accommodations.length === 0) return null;

    const today = new Date().toISOString().split('T')[0];
    if (!today) return null;

    return accommodations.find(
      (acc) => acc.startDate <= today && acc.endDate >= today
    );
  };

  const currentAccommodation = getCurrentAccommodation();

  return (
    <div className="flex min-h-full flex-col bg-background">
      {/* Header */}
      <PageHeader title="Reservations" />

      {/* Main content */}
      <main className="flex-1 p-4 space-y-4">
        {/* Loading state */}
        {accommodations === undefined && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-background-secondary" />
                  <div className="flex-1">
                    <div className="h-5 w-40 bg-background-secondary rounded" />
                    <div className="h-4 w-24 bg-background-secondary rounded mt-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {accommodations && accommodations.length === 0 && (
          <div className="text-center py-12">
            <span className="text-4xl">🏨</span>
            <p className="mt-4 text-foreground-secondary">No accommodations found</p>
            <p className="mt-1 text-sm text-foreground-tertiary">
              Sync with Supabase to load reservation data
            </p>
          </div>
        )}

        {/* Accommodation list */}
        {accommodations && accommodations.length > 0 && (
          <div className="space-y-4">
            {/* Quick summary */}
            <div className="bg-background-secondary rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-foreground-secondary">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{accommodations.length} stays across the trip</span>
              </div>
              {currentAccommodation && (
                <p className="mt-2 text-sm">
                  <span className="text-foreground-tertiary">Currently at: </span>
                  <span className="font-medium text-foreground">{currentAccommodation.name}</span>
                </p>
              )}
            </div>

            {/* Accommodation cards */}
            {accommodations.map((accommodation) => (
              <AccommodationCard
                key={accommodation.id}
                accommodation={accommodation}
                isCurrent={currentAccommodation?.id === accommodation.id}
                isExpandedFromUrl={hotelParam === accommodation.id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

/**
 * Loading fallback for Suspense
 */
function ReservationsLoading() {
  return (
    <div className="flex min-h-full flex-col bg-background">
      <PageHeader title="Reservations" />
      <main className="flex-1 p-4 space-y-4">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-background-secondary" />
                <div className="flex-1">
                  <div className="h-5 w-40 bg-background-secondary rounded" />
                  <div className="h-4 w-24 bg-background-secondary rounded mt-2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

/**
 * Reservations page showing all accommodations
 * Current accommodation is highlighted and expanded by default
 * Supports ?hotel=<id> parameter to expand a specific hotel
 */
export default function ReservationsPage() {
  return (
    <Suspense fallback={<ReservationsLoading />}>
      <ReservationsContent />
    </Suspense>
  );
}
