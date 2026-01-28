'use client';

import { useState, useEffect } from 'react';

/**
 * Banner that appears when a new version of the app is available
 * Prompts user to reload to get the latest updates
 */
export function UpdateBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const handleUpdate = (registration: ServiceWorkerRegistration) => {
      if (registration.waiting) {
        setWaitingWorker(registration.waiting);
        setShowBanner(true);
      }
    };

    // Check if there's already a waiting worker
    navigator.serviceWorker.ready.then((registration) => {
      if (registration.waiting) {
        handleUpdate(registration);
      }

      // Listen for new service worker installing
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available
            setWaitingWorker(newWorker);
            setShowBanner(true);
          }
        });
      });
    });

    // Handle controller change (when skipWaiting is called)
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[300] safe-area-inset-top">
      <div className="bg-primary text-white px-4 py-3 shadow-lg">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg">✨</span>
            <p className="text-sm font-medium truncate">New version available!</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 text-sm font-medium text-white/80 hover:text-white transition-colors"
            >
              Later
            </button>
            <button
              onClick={handleUpdate}
              className="px-3 py-1.5 bg-white text-primary text-sm font-bold rounded-lg hover:bg-white/90 transition-colors"
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
