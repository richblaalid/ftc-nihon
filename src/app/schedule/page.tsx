'use client';

import { Suspense, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useActivitiesWithTransit, useCurrentActivity, useCurrentDayNumber } from '@/db/hooks';
import { DayStrip } from '@/components/ui';
import { Timeline } from '@/components/schedule/Timeline';
import Link from 'next/link';

function ScheduleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentDayNumber = useCurrentDayNumber();

  // Get day from URL or use current day (URL is source of truth)
  const dayParam = searchParams.get('day');
  const selectedDay = dayParam ? parseInt(dayParam, 10) : (currentDayNumber ?? 1);
  const [isPending, startTransition] = useTransition();

  // Update URL when day changes with non-blocking transition
  const handleDayChange = (day: number) => {
    startTransition(() => {
      router.push(`/schedule?day=${day}`, { scroll: false });
    });
  };

  // Fetch activities for selected day
  const activities = useActivitiesWithTransit(selectedDay);
  const currentActivity = useCurrentActivity();

  // Determine if we're viewing today
  const isToday = selectedDay === currentDayNumber;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-background-secondary bg-background/95 pb-2 pt-safe backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 pt-2">
          {/* Back button */}
          <Link
            href="/"
            className="flex min-h-touch min-w-touch items-center justify-center rounded-full text-foreground-secondary hover:bg-background-secondary"
          >
            <span className="text-xl">←</span>
          </Link>

          <h1 className="font-display text-xl text-foreground">Schedule</h1>

          {/* Today button */}
          {!isToday && currentDayNumber && (
            <button
              onClick={() => handleDayChange(currentDayNumber)}
              disabled={isPending}
              className={`rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary ${isPending ? 'opacity-70 cursor-wait' : ''}`}
            >
              Today
            </button>
          )}
          {(isToday || !currentDayNumber) && <div className="w-12" />}
        </div>

        {/* Day strip navigation */}
        <div className="mt-2">
          <DayStrip
            selectedDay={selectedDay}
            currentDay={currentDayNumber}
            onDayChange={handleDayChange}
            isPending={isPending}
          />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 py-4 pb-safe">
        {activities === undefined ? (
          // Loading state
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 w-20 rounded bg-background-secondary" />
                <div className="mt-2 h-6 w-48 rounded bg-background-secondary" />
                <div className="mt-2 h-4 w-32 rounded bg-background-secondary" />
              </div>
            ))}
          </div>
        ) : (
          <Timeline
            activities={activities}
            currentActivityId={isToday ? currentActivity?.id : null}
          />
        )}
      </main>
    </div>
  );
}

function ScheduleLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-background-secondary bg-background pb-2 pt-safe">
        <div className="flex items-center justify-between px-4 pt-2">
          <div className="h-10 w-10 animate-pulse rounded-full bg-background-secondary" />
          <div className="h-6 w-24 animate-pulse rounded bg-background-secondary" />
          <div className="w-12" />
        </div>
        {/* Day strip skeleton */}
        <div className="mt-2 flex gap-2 overflow-hidden px-4 py-2">
          <div className="h-5 w-12 animate-pulse rounded-full bg-background-secondary" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 w-11 animate-pulse rounded-xl bg-background-secondary" />
          ))}
        </div>
        <div className="mx-4 mt-1 h-1 animate-pulse rounded-full bg-background-secondary" />
      </header>
      <main className="flex-1 p-4">
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 w-20 rounded bg-background-secondary" />
              <div className="mt-2 h-6 w-48 rounded bg-background-secondary" />
              <div className="mt-2 h-4 w-32 rounded bg-background-secondary" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default function SchedulePage() {
  return (
    <Suspense fallback={<ScheduleLoading />}>
      <ScheduleContent />
    </Suspense>
  );
}
