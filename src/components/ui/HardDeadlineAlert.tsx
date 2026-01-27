'use client';

import type { HardDeadline } from '@/types/database';

interface HardDeadlineAlertProps {
  deadline: HardDeadline;
  className?: string;
  variant?: 'prominent' | 'compact' | 'inline';
}

/**
 * Hard deadline alert component
 * Shows time-sensitive deadlines prominently
 */
export function HardDeadlineAlert({ deadline, className = '', variant = 'prominent' }: HardDeadlineAlertProps) {
  if (variant === 'inline') {
    return (
      <span
        className={`
          inline-flex items-center gap-1.5
          px-2 py-0.5 rounded-full
          bg-red-100 dark:bg-red-900/40
          text-red-700 dark:text-red-300
          text-xs font-semibold
          ${className}
        `}
      >
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
        {deadline.time}
      </span>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        className={`
          flex items-center gap-3 px-3 py-2 rounded-lg
          bg-gradient-to-r from-red-50 to-orange-50
          dark:from-red-950/30 dark:to-orange-950/30
          border border-red-200 dark:border-red-800
          ${className}
        `}
      >
        <div className="shrink-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-red-700 dark:text-red-400">{deadline.time}</p>
          <p className="text-xs text-red-600 dark:text-red-500 truncate">{deadline.description}</p>
        </div>
      </div>
    );
  }

  // Prominent variant (default)
  return (
    <div
      className={`
        relative overflow-hidden rounded-xl p-4
        bg-gradient-to-br from-red-500 via-red-500 to-orange-500
        text-white shadow-lg shadow-red-500/25
        ${className}
      `}
    >
      {/* Animated pulse background */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />

      {/* Decorative clock icon */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-20">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full -translate-y-4 translate-x-4">
          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
        </svg>
      </div>

      <div className="relative flex items-start gap-4">
        {/* Icon */}
        <div className="shrink-0 w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-white/80">
            Hard Deadline
          </p>
          <p className="text-2xl font-bold tracking-tight">{deadline.time}</p>
          <p className="text-sm text-white/90 mt-1">{deadline.description}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * List of hard deadlines for a day
 */
interface HardDeadlineListProps {
  deadlines: HardDeadline[];
  className?: string;
  variant?: 'prominent' | 'compact';
}

export function HardDeadlineList({ deadlines, className = '', variant = 'compact' }: HardDeadlineListProps) {
  if (deadlines.length === 0) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      <h3 className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider flex items-center gap-1.5">
        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        Time-Sensitive ({deadlines.length})
      </h3>
      <div className="space-y-2">
        {deadlines.map((deadline, i) => (
          <HardDeadlineAlert key={i} deadline={deadline} variant={variant} />
        ))}
      </div>
    </div>
  );
}

/**
 * Banner alert for critical deadlines (use sparingly)
 */
interface CriticalDeadlineBannerProps {
  deadline: HardDeadline;
  onDismiss?: () => void;
  className?: string;
}

export function CriticalDeadlineBanner({ deadline, onDismiss, className = '' }: CriticalDeadlineBannerProps) {
  return (
    <div
      className={`
        relative overflow-hidden
        px-4 py-3
        bg-gradient-to-r from-red-600 via-red-500 to-orange-500
        text-white
        ${className}
      `}
      role="alert"
    >
      {/* Animated shimmer */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        style={{
          animation: 'shimmer 2s infinite',
        }}
      />

      <div className="relative flex items-center gap-3">
        <span className="shrink-0 text-xl animate-bounce">⏰</span>
        <div className="flex-1">
          <p className="font-bold">{deadline.time} — {deadline.description}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="shrink-0 p-1 hover:bg-white/20 rounded transition-colors"
            aria-label="Dismiss"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
