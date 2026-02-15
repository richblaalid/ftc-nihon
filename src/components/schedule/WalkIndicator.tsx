'use client';

interface WalkIndicatorProps {
  /** Destination name */
  destination: string;
  /** Duration in minutes */
  duration?: number;
  /** Whether this walk is completed */
  isCompleted?: boolean;
}

/**
 * WalkIndicator - A minimal indicator for walking between activities
 * Used when there's no full transit segment, just a short walk
 */
export function WalkIndicator({
  destination,
  duration,
  isCompleted = false,
}: WalkIndicatorProps) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 text-sm ${
        isCompleted ? 'opacity-50' : 'text-foreground-secondary'
      }`}
    >
      <span className="text-base" aria-hidden="true">
        🚶
      </span>
      <span>
        Walk to {destination}
        {duration && duration > 0 && (
          <span className="text-foreground-tertiary"> ({duration}min)</span>
        )}
      </span>
    </div>
  );
}
