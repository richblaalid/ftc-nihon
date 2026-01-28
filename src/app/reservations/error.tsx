'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error boundary for the Reservations page
 */
export default function ReservationsError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[Reservations Error]', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col bg-background pb-safe">
      <PageHeader title="Reservations" />

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <span className="text-4xl">🏨</span>
        <h2 className="mt-4 text-lg font-semibold text-foreground">
          Unable to load reservations
        </h2>
        <p className="mt-2 text-center text-foreground-secondary max-w-xs">
          There was a problem loading your reservation data. This might be a temporary issue.
        </p>

        <div className="mt-6 flex gap-3">
          <button onClick={reset} className="btn-secondary">
            Try again
          </button>
          <Link href="/" className="btn-primary">
            Go home
          </Link>
        </div>
      </main>
    </div>
  );
}
