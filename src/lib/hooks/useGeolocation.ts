'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

export interface GeolocationState {
  /** Current latitude */
  lat: number | null;
  /** Current longitude */
  lng: number | null;
  /** Accuracy in meters */
  accuracy: number | null;
  /** Heading in degrees (0-360, null if not moving) */
  heading: number | null;
  /** Whether we're actively tracking location */
  isTracking: boolean;
  /** Whether geolocation is supported */
  isSupported: boolean;
  /** Error message if any */
  error: string | null;
  /** Last update timestamp */
  timestamp: number | null;
}

interface UseGeolocationOptions {
  /** Enable high accuracy (uses more battery) */
  enableHighAccuracy?: boolean;
  /** Max age of cached position in ms */
  maximumAge?: number;
  /** Timeout for getting position in ms */
  timeout?: number;
  /** Auto-start tracking on mount */
  autoStart?: boolean;
}

const DEFAULT_OPTIONS = {
  enableHighAccuracy: true,
  maximumAge: 10000, // 10 seconds
  timeout: 15000, // 15 seconds
  autoStart: false,
} as const;

export function useGeolocation(options: UseGeolocationOptions = {}) {
  // Memoize the geolocation options to avoid recreating on every render
  const geoOptions = useMemo<PositionOptions>(() => ({
    enableHighAccuracy: options.enableHighAccuracy ?? DEFAULT_OPTIONS.enableHighAccuracy,
    maximumAge: options.maximumAge ?? DEFAULT_OPTIONS.maximumAge,
    timeout: options.timeout ?? DEFAULT_OPTIONS.timeout,
  }), [options.enableHighAccuracy, options.maximumAge, options.timeout]);

  const autoStart = options.autoStart ?? DEFAULT_OPTIONS.autoStart;

  const [state, setState] = useState<GeolocationState>({
    lat: null,
    lng: null,
    accuracy: null,
    heading: null,
    isTracking: false,
    isSupported: typeof navigator !== 'undefined' && 'geolocation' in navigator,
    error: null,
    timestamp: null,
  });

  const [watchId, setWatchId] = useState<number | null>(null);

  /**
   * Handle successful position update
   */
  const handleSuccess = useCallback((position: GeolocationPosition) => {
    setState((prev) => ({
      ...prev,
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy,
      heading: position.coords.heading,
      timestamp: position.timestamp,
      error: null,
    }));
  }, []);

  /**
   * Handle geolocation error
   */
  const handleError = useCallback((error: GeolocationPositionError) => {
    let errorMessage = 'Unknown error';
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Location permission denied';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location unavailable';
        break;
      case error.TIMEOUT:
        errorMessage = 'Location request timed out';
        break;
    }

    setState((prev) => ({
      ...prev,
      error: errorMessage,
      isTracking: false,
    }));
  }, []);

  /**
   * Start tracking location
   */
  const startTracking = useCallback(() => {
    if (!state.isSupported) {
      setState((prev) => ({
        ...prev,
        error: 'Geolocation not supported',
      }));
      return;
    }

    if (watchId !== null) {
      // Already tracking
      return;
    }

    setState((prev) => ({ ...prev, isTracking: true, error: null }));

    const id = navigator.geolocation.watchPosition(handleSuccess, handleError, geoOptions);

    setWatchId(id);
  }, [state.isSupported, watchId, handleSuccess, handleError, geoOptions]);

  /**
   * Stop tracking location
   */
  const stopTracking = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setState((prev) => ({ ...prev, isTracking: false }));
    }
  }, [watchId]);

  /**
   * Get current position once (no continuous tracking)
   */
  const getCurrentPosition = useCallback(() => {
    if (!state.isSupported) {
      setState((prev) => ({
        ...prev,
        error: 'Geolocation not supported',
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, geoOptions);
  }, [state.isSupported, handleSuccess, handleError, geoOptions]);

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart && state.isSupported) {
      startTracking();
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    ...state,
    startTracking,
    stopTracking,
    getCurrentPosition,
  };
}
