'use client';

import { Suspense, useEffect, useCallback, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useActivitiesWithTransit, useCurrentActivity, useCurrentDayNumber, useDayInfo } from '@/db/hooks';
import { DayStrip, PageHeader } from '@/components/ui';
import { Timeline } from '@/components/schedule/Timeline';
import { AllDaysView } from '@/components/schedule/AllDaysView';
import { useAppStore, type ScheduleViewMode } from '@/stores/app-store';
import { DayHeader } from '@/components/ui/DayHeader';
import { HardDeadlineList } from '@/components/ui/HardDeadlineAlert';
import { useSwipe } from '@/lib/hooks/useSwipe';
import { safeJsonParse } from '@/lib/json-utils';
import { TRIP_DAYS } from '@/types/database';
import type { HardDeadline } from '@/types/database';

/**
 * View mode toggle component - segmented control style
 */
function ViewModeToggle({
  mode,
  onChange,
}: {
  mode: ScheduleViewMode;
  onChange: (mode: ScheduleViewMode) => void;
}) {
  return (
    <div className="flex rounded-full bg-background-secondary p-0.5">
      <button
        onClick={() => onChange('day')}
        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
          mode === 'day'
            ? 'bg-primary text-on-primary'
            : 'text-foreground-secondary hover:text-foreground'
        }`}
        aria-pressed={mode === 'day'}
      >
        Day
      </button>
      <button
        onClick={() => onChange('all')}
        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
          mode === 'all'
            ? 'bg-primary text-on-primary'
            : 'text-foreground-secondary hover:text-foreground'
        }`}
        aria-pressed={mode === 'all'}
      >
        All Days
      </button>
    </div>
  );
}

type SlideDirection = 'left' | 'right' | null;

function ScheduleContent() {
  const searchParams = useSearchParams();
  const currentDayNumber = useCurrentDayNumber();

  // Global day selection and view mode from store
  const globalSelectedDay = useAppStore((state) => state.selectedDay);
  const viewMode = useAppStore((state) => state.scheduleViewMode);
  const setViewMode = useAppStore((state) => state.setScheduleViewMode);

  // Refs for day sections in All Days view (for scroll-to navigation)
  const daySectionRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Transition state for smooth animations
  const [slideDirection, setSlideDirection] = useState<SlideDirection>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // On mount only, check URL param and sync to store if present
  const dayParam = searchParams.get('day');
  useEffect(() => {
    if (dayParam) {
      const day = parseInt(dayParam, 10);
      if (day >= 0 && day <= 15) {
        useAppStore.getState().setSelectedDay(day);
      }
    }
  }, [dayParam]);

  // Effective day: store value takes precedence, otherwise current day, otherwise day 1
  const selectedDay = globalSelectedDay ?? currentDayNumber ?? 1;

  // Update store when day changes with smooth transition
  const handleDayChange = useCallback((day: number, direction?: SlideDirection) => {
    // Clear any pending transition
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    // Auto-detect direction if not provided
    const slideDir = direction ?? (day > (globalSelectedDay ?? currentDayNumber ?? 1) ? 'left' : 'right');

    // Start exit animation
    setSlideDirection(slideDir);
    setIsTransitioning(true);

    // After exit animation, change day and start enter animation
    transitionTimeoutRef.current = setTimeout(() => {
      useAppStore.getState().setSelectedDay(day);
      // Scroll to top
      const scrollContainer = document.getElementById('main-scroll-container');
      scrollContainer?.scrollTo({ top: 0, behavior: 'instant' });

      // End transition after enter animation
      transitionTimeoutRef.current = setTimeout(() => {
        setIsTransitioning(false);
        setSlideDirection(null);
      }, 200);
    }, 150);
  }, [globalSelectedDay, currentDayNumber]);

  // Direct day change (from DayStrip tap)
  // In "day" mode: switch day, no animation
  // In "all" mode: scroll to that day's section
  const handleDirectDayChange = useCallback((day: number) => {
    if (viewMode === 'all') {
      // Scroll to the day section
      const section = daySectionRefs.current.get(day);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      useAppStore.getState().setSelectedDay(day);
      const scrollContainer = document.getElementById('main-scroll-container');
      scrollContainer?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [viewMode]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  // Swipe handlers for day navigation
  const swipeHandlers = useSwipe({
    onSwipeLeft: useCallback(() => {
      // Swipe left = go to next day
      if (selectedDay < TRIP_DAYS - 1 && !isTransitioning) {
        handleDayChange(selectedDay + 1, 'left');
      }
    }, [selectedDay, handleDayChange, isTransitioning]),
    onSwipeRight: useCallback(() => {
      // Swipe right = go to previous day
      if (selectedDay > 0 && !isTransitioning) {
        handleDayChange(selectedDay - 1, 'right');
      }
    }, [selectedDay, handleDayChange, isTransitioning]),
    threshold: 50,
    maxVerticalMovement: 100,
  });

  // Fetch activities for selected day
  const activities = useActivitiesWithTransit(selectedDay);
  const currentActivity = useCurrentActivity();
  const dayInfo = useDayInfo(selectedDay);

  // Parse hard deadlines from day info (safe parse prevents crashes on corrupted data)
  const hardDeadlines: HardDeadline[] = safeJsonParse<HardDeadline[]>(
    dayInfo?.hardDeadlines,
    []
  );

  // Determine if we're viewing today
  const isToday = selectedDay === currentDayNumber;

  return (
    <div className="flex min-h-full flex-col bg-background">
      {/* Header */}
      <PageHeader
        title="Schedule"
        rightAction={
          <div className="flex items-center gap-2">
            {viewMode === 'day' && !isToday && currentDayNumber ? (
              <button
                onClick={() => handleDayChange(currentDayNumber)}
                className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
              >
                Today
              </button>
            ) : null}
            <ViewModeToggle mode={viewMode} onChange={setViewMode} />
          </div>
        }
      >
        {/* Day strip navigation */}
        <div className="pb-2">
          <DayStrip
            selectedDay={viewMode === 'day' ? selectedDay : null}
            currentDay={currentDayNumber}
            onDayChange={handleDirectDayChange}
          />
        </div>
      </PageHeader>

      {/* Main content */}
      {viewMode === 'all' ? (
        // All Days view
        <main className="flex-1">
          <AllDaysView daySectionRefs={daySectionRefs} />
        </main>
      ) : (
        // Day view - swipeable area with slide transitions
        <main
          className={`flex-1 px-4 py-4 pb-4 transition-all duration-200 ease-out ${
            isTransitioning
              ? slideDirection === 'left'
                ? '-translate-x-4 opacity-0'
                : 'translate-x-4 opacity-0'
              : 'translate-x-0 opacity-100'
          }`}
          {...swipeHandlers}
        >
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
            <div className="flex flex-col gap-4">
              {/* Day header with metadata */}
              {dayInfo && <DayHeader dayInfo={dayInfo} />}

              {/* Hard deadlines for this day */}
              {hardDeadlines.length > 0 && (
                <HardDeadlineList deadlines={hardDeadlines} />
              )}

              {/* Activity timeline */}
              <Timeline
                activities={activities}
                currentActivityId={isToday ? currentActivity?.id : null}
              />
            </div>
          )}
        </main>
      )}
    </div>
  );
}

function ScheduleLoading() {
  return (
    <div className="flex min-h-full flex-col bg-background">
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
            <div key={i} className="h-16 w-11 animate-pulse rounded-xl bg-background-secondary" />
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
