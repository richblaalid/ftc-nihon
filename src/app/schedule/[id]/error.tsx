'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error boundary for the Activity detail page
 */
export default function ActivityError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[Activity Detail Error]', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-background-secondary bg-background px-4 pb-3 pt-safe">
        <div className="flex items-center gap-3 pt-2">
          <Link
            href="/schedule"
            className="flex min-h-touch min-w-touch items-center justify-center rounded-full text-foreground-secondary hover:bg-background-secondary"
          >
            <span className="text-xl">←</span>
          </Link>
          <span className="text-foreground-secondary">Activity</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <span className="text-4xl">📋</span>
        <h2 className="mt-4 text-lg font-semibold text-foreground">
          Unable to load activity
        </h2>
        <p className="mt-2 text-center text-foreground-secondary max-w-xs">
          There was a problem loading this activity. This might be a temporary issue.
        </p>

        <div className="mt-6 flex gap-3">
          <button onClick={reset} className="btn-secondary">
            Try again
          </button>
          <Link href="/schedule" className="btn-primary">
            Back to Schedule
          </Link>
        </div>
      </main>
    </div>
  );
}
