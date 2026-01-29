'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global error boundary for the app
 * Catches unhandled errors and shows a friendly message
 */
export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error for debugging
    console.error('[Error Boundary]', error);
  }, [error]);

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-background p-4">
      <span className="text-5xl">😵</span>
      <h1 className="mt-4 text-xl font-bold text-foreground">Something went wrong</h1>
      <p className="mt-2 text-center text-foreground-secondary max-w-xs">
        {error.message || 'An unexpected error occurred'}
      </p>

      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="btn-secondary"
        >
          Try again
        </button>
        <Link href="/" className="btn-primary">
          Go home
        </Link>
      </div>

      {/* Show more details in development */}
      {process.env.NODE_ENV === 'development' && error.digest && (
        <p className="mt-4 text-xs text-foreground-tertiary">
          Error ID: {error.digest}
        </p>
      )}
    </div>
  );
}
