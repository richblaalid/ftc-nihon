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

type SlideDirection = 'left' | 'right' | null;

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
    <div className="flex rounded-lg bg-background-secondary p-0.5" data-print-hide>
      <button
        onClick={() => onChange('day')}
        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
          mode === 'day'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-foreground-secondary hover:text-foreground'
        }`}
      >
        Day
      </button>
      <button
        onClick={() => onChange('all')}
        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
          mode === 'all'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-foreground-secondary hover:text-foreground'
        }`}
      >
        All Days
      </button>
    </div>
  );
}

function ScheduleContent() {
  const searchParams = useSearchParams();
  const currentDayNumber = useCurrentDayNumber();

  // Global state from store
  const globalSelectedDay = useAppStore((state) => state.selectedDay);
  const viewMode = useAppStore((state) => state.scheduleViewMode);
  const setViewMode = useAppStore((state) => state.setScheduleViewMode);

  // State for scrolling to day in All Days view
  const [scrollToDay, setScrollToDay] = useState<number | null>(null);

  // Track header height for sticky day headers in All Days view
  const [headerHeight, setHeaderHeight] = useState(0);

  // Measure header height on mount and resize
  // Query for the header element directly to avoid breaking sticky positioning
  useEffect(() => {
    const header = document.querySelector('header');
    if (!header) return;

    const updateHeaderHeight = () => {
      setHeaderHeight(header.offsetHeight);
    };

    updateHeaderHeight();

    // Re-measure on resize (for orientation changes, etc.)
    const observer = new ResizeObserver(updateHeaderHeight);
    observer.observe(header);

    return () => observer.disconnect();
  }, []);

  // Transition state for smooth animations
  const [slideDirection, setSlideDirection] = useState<SlideDirection>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // On mount only, check URL param and sync to store if present
  const dayParam = searchParams.get('day');
  const viewParam = searchParams.get('view');
  useEffect(() => {
    if (dayParam) {
      const day = parseInt(dayParam, 10);
      if (day >= 0 && day <= 15) {
        useAppStore.getState().setSelectedDay(day);
      }
    }
    if (viewParam === 'all') {
      useAppStore.getState().setScheduleViewMode('all');
    }
  }, [dayParam, viewParam]);

  // Effective day: store value takes precedence, otherwise current day, otherwise day 1
  const selectedDay = globalSelectedDay ?? currentDayNumber ?? 1;

  // Update store when day changes with smooth transition
  const handleDayChange = useCallback((day: number, direction?: SlideDirection) => {
    // If in "all" mode, scroll to day section instead of changing view
    if (viewMode === 'all') {
      setScrollToDay(day);
      return;
    }

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
  }, [globalSelectedDay, currentDayNumber, viewMode]);

  // Direct day change (from DayStrip tap)
  const handleDirectDayChange = useCallback((day: number) => {
    if (viewMode === 'all') {
      setScrollToDay(day);
      return;
    }
    useAppStore.getState().setSelectedDay(day);
    const scrollContainer = document.getElementById('main-scroll-container');
    scrollContainer?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [viewMode]);

  // Handle scroll complete
  const handleScrollComplete = useCallback(() => {
    setScrollToDay(null);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  // Swipe handlers for day navigation (only in day view)
  const swipeHandlers = useSwipe({
    onSwipeLeft: useCallback(() => {
      if (viewMode === 'all') return;
      if (selectedDay < TRIP_DAYS - 1 && !isTransitioning) {
        handleDayChange(selectedDay + 1, 'left');
      }
    }, [selectedDay, handleDayChange, isTransitioning, viewMode]),
    onSwipeRight: useCallback(() => {
      if (viewMode === 'all') return;
      if (selectedDay > 0 && !isTransitioning) {
        handleDayChange(selectedDay - 1, 'right');
      }
    }, [selectedDay, handleDayChange, isTransitioning, viewMode]),
    threshold: 50,
    maxVerticalMovement: 100,
  });

  // Fetch activities for selected day
  const activities = useActivitiesWithTransit(selectedDay);
  const currentActivity = useCurrentActivity();
  const dayInfo = useDayInfo(selectedDay);

  // Parse hard deadlines from day info
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
            <ViewModeToggle mode={viewMode} onChange={setViewMode} />
            {viewMode === 'day' && !isToday && currentDayNumber !== null && (
              <button
                onClick={() => handleDayChange(currentDayNumber)}
                className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
              >
                Today
              </button>
            )}
          </div>
        }
      >
        {/* Day strip navigation - show in both modes but behavior differs */}
        <div className="pb-2" data-print-hide>
          <DayStrip
            selectedDay={viewMode === 'day' ? selectedDay : null}
            currentDay={currentDayNumber}
            onDayChange={handleDirectDayChange}
          />
        </div>
      </PageHeader>

      {/* Main content */}
      {viewMode === 'all' ? (
        <main className="flex-1 px-4 py-4 pb-4">
          <AllDaysView
            scrollToDay={scrollToDay}
            onScrollComplete={handleScrollComplete}
            stickyTopOffset={headerHeight}
          />
        </main>
      ) : (
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
