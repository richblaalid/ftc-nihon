'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error boundary for the Map page
 */
export default function MapError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[Map Error]', error);
  }, [error]);

  return (
    <div className="flex flex-col bg-background" style={{ height: 'calc(100dvh - 4rem - env(safe-area-inset-bottom))' }}>
      <PageHeader title="Map" />

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <span className="text-4xl">🗺️</span>
        <h2 className="mt-4 text-lg font-semibold text-foreground">
          Unable to load map
        </h2>
        <p className="mt-2 text-center text-foreground-secondary max-w-xs">
          There was a problem loading the map. This might happen when offline.
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
