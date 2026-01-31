'use client';

import { useRef, useCallback, useEffect } from 'react';

interface SwipeConfig {
  /** Minimum distance (px) to trigger a swipe. Default: 50 */
  threshold?: number;
  /** Maximum vertical movement (px) allowed. Default: 100 */
  maxVerticalMovement?: number;
  /** Callback when swiping left */
  onSwipeLeft?: () => void;
  /** Callback when swiping right */
  onSwipeRight?: () => void;
  /** Whether swipe is enabled. Default: true */
  enabled?: boolean;
}

interface SwipeHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
}

/**
 * Hook for detecting horizontal swipe gestures
 *
 * @example
 * const swipeHandlers = useSwipe({
 *   onSwipeLeft: () => goToNextDay(),
 *   onSwipeRight: () => goToPrevDay(),
 * });
 *
 * return <div {...swipeHandlers}>Content</div>;
 */
export function useSwipe({
  threshold = 50,
  maxVerticalMovement = 100,
  onSwipeLeft,
  onSwipeRight,
  enabled = true,
}: SwipeConfig): SwipeHandlers {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled) return;
      touchStartX.current = e.touches[0]?.clientX ?? null;
      touchStartY.current = e.touches[0]?.clientY ?? null;
      touchEndX.current = null;
      touchEndY.current = null;
    },
    [enabled]
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled) return;
      touchEndX.current = e.touches[0]?.clientX ?? null;
      touchEndY.current = e.touches[0]?.clientY ?? null;
    },
    [enabled]
  );

  const onTouchEnd = useCallback(
    () => {
      if (!enabled) return;
      if (
        touchStartX.current === null ||
        touchEndX.current === null ||
        touchStartY.current === null ||
        touchEndY.current === null
      ) {
        return;
      }

      const deltaX = touchEndX.current - touchStartX.current;
      const deltaY = Math.abs(touchEndY.current - touchStartY.current);

      // Ignore if vertical movement is too large (user is scrolling)
      if (deltaY > maxVerticalMovement) {
        return;
      }

      // Check if swipe distance exceeds threshold
      if (Math.abs(deltaX) >= threshold) {
        if (deltaX < 0 && onSwipeLeft) {
          // Swiped left (next)
          onSwipeLeft();
        } else if (deltaX > 0 && onSwipeRight) {
          // Swiped right (previous)
          onSwipeRight();
        }
      }

      // Reset
      touchStartX.current = null;
      touchStartY.current = null;
      touchEndX.current = null;
      touchEndY.current = null;
    },
    [enabled, threshold, maxVerticalMovement, onSwipeLeft, onSwipeRight]
  );

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}

/**
 * Hook variant that attaches to a ref element directly
 * Useful when you can't spread handlers onto the element
 */
export function useSwipeRef<T extends HTMLElement>(config: SwipeConfig): React.RefObject<T | null> {
  const ref = useRef<T>(null);
  const { threshold = 50, maxVerticalMovement = 100, onSwipeLeft, onSwipeRight, enabled = true } = config;

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0]?.clientX ?? null;
      touchStartY.current = e.touches[0]?.clientY ?? null;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null) return;

      const touch = e.changedTouches[0];
      if (!touch) return;

      const deltaX = touch.clientX - touchStartX.current;
      const deltaY = Math.abs(touch.clientY - touchStartY.current);

      // Ignore if vertical movement is too large
      if (deltaY > maxVerticalMovement) {
        touchStartX.current = null;
        touchStartY.current = null;
        return;
      }

      if (Math.abs(deltaX) >= threshold) {
        if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        } else if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        }
      }

      touchStartX.current = null;
      touchStartY.current = null;
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, threshold, maxVerticalMovement, onSwipeLeft, onSwipeRight]);

  return ref;
}
