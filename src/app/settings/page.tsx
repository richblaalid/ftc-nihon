'use client';

import { useState } from 'react';
import Link from 'next/link';
import { db } from '@/db/database';
import { reseedDatabase } from '@/db/seed';
import { seedAICache } from '@/db/seed-ai-cache';
import { seedTourContent } from '@/db/seed-tour-content';

export default function SettingsPage() {
  const [isResetting, setIsResetting] = useState(false);
  const [resetStatus, setResetStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleResetData = async () => {
    if (!confirm('This will reset all app data and reload. Your meal selections will be lost. Continue?')) {
      return;
    }

    setIsResetting(true);
    setResetStatus('idle');

    try {
      // Delete the entire database
      await db.delete();

      // Reopen and reseed
      await db.open();
      const result = await reseedDatabase();

      if (result.success) {
        // Also seed AI cache and tour content
        await seedAICache();
        await seedTourContent();

        setResetStatus('success');
        setStatusMessage('App data reset successfully. Reloading...');

        // Reload after a short delay
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('[Settings] Reset error:', error);
      setResetStatus('error');
      setStatusMessage(error instanceof Error ? error.message : 'Unknown error');
      setIsResetting(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-background-secondary bg-background/95 px-4 pb-3 pt-safe backdrop-blur-sm">
        <div className="flex items-center gap-3 pt-2">
          <Link
            href="/"
            className="flex min-h-touch min-w-touch items-center justify-center rounded-full text-foreground-secondary hover:bg-background-secondary"
            aria-label="Go back"
          >
            <span className="text-xl">←</span>
          </Link>
          <h1 className="text-lg font-semibold text-foreground">Settings</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-4 pb-safe space-y-6">
        {/* App Info */}
        <section className="card">
          <h2 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-3">
            App Information
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-foreground-secondary">Version</span>
              <span className="text-foreground">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground-secondary">Database</span>
              <span className="text-foreground">IndexedDB v5</span>
            </div>
          </div>
        </section>

        {/* Data Management */}
        <section className="card">
          <h2 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-3">
            Data Management
          </h2>
          <p className="text-sm text-foreground-secondary mb-4">
            If the app is not loading data correctly, you can reset all app data.
            This will clear your meal selections and chat history.
          </p>

          <button
            onClick={handleResetData}
            disabled={isResetting}
            className="w-full py-3 px-4 bg-error/10 text-error rounded-lg font-medium
                       hover:bg-error/20 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors"
          >
            {isResetting ? 'Resetting...' : 'Reset App Data'}
          </button>

          {resetStatus === 'success' && (
            <p className="mt-3 text-sm text-success text-center">{statusMessage}</p>
          )}
          {resetStatus === 'error' && (
            <p className="mt-3 text-sm text-error text-center">{statusMessage}</p>
          )}
        </section>

        {/* Offline Status */}
        <section className="card">
          <h2 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-3">
            Connection Status
          </h2>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${typeof navigator !== 'undefined' && navigator.onLine ? 'bg-success' : 'bg-error'}`} />
            <span className="text-sm text-foreground">
              {typeof navigator !== 'undefined' && navigator.onLine ? 'Online' : 'Offline'}
            </span>
          </div>
          <p className="text-xs text-foreground-tertiary mt-2">
            This app works fully offline once data is loaded.
          </p>
        </section>
      </main>
    </div>
  );
}
