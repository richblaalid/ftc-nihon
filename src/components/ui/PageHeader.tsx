'use client';

import Link from 'next/link';

interface PageHeaderProps {
  title: string;
  /** Optional subtitle below the title */
  subtitle?: string;
  /** Show back button (default: true) */
  showBack?: boolean;
  /** Back link href (default: /) */
  backHref?: string;
  /** Right side action button */
  rightAction?: React.ReactNode;
  /** Additional content below title (e.g., DayStrip) */
  children?: React.ReactNode;
}

/**
 * Branded page header with centered display title
 * Used for top-level pages (Map, Schedule, Reservations)
 */
export function PageHeader({
  title,
  subtitle,
  showBack = true,
  backHref = '/',
  rightAction,
  children,
}: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm pt-safe">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Back button */}
        {showBack ? (
          <Link
            href={backHref}
            aria-label="Back to home"
            className="flex min-h-touch min-w-touch items-center justify-center rounded-full text-foreground-secondary hover:bg-background-secondary active:scale-95 transition-transform"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        ) : (
          <div className="min-w-touch" />
        )}

        {/* Centered title */}
        <div className="flex-1 text-center">
          <h1 className="font-display text-xl tracking-wide text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-foreground-tertiary mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {/* Right action or spacer */}
        {rightAction ? (
          <div className="flex min-w-touch items-center justify-end">
            {rightAction}
          </div>
        ) : (
          <div className="min-w-touch" />
        )}
      </div>

      {/* Optional children (e.g., DayStrip) */}
      {children}
    </header>
  );
}
