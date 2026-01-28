'use client';

import { useState, useEffect, useCallback } from 'react';
import type { TripInfo } from '@/types/database';

interface EmergencySheetProps {
  tripInfo: TripInfo;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Emergency contact sheet - bottom drawer pattern
 * Shows guide contact and emergency numbers with tap-to-call
 */
export function EmergencySheet({ tripInfo, isOpen, onClose }: EmergencySheetProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle open/close animations
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isVisible) return null;

  const emergencyContacts = [
    {
      label: 'Police',
      number: tripInfo.emergencyPolice,
      icon: '🚔',
      description: 'For crime or emergency',
      bgClass: 'bg-blue-500',
    },
    {
      label: 'Fire & Ambulance',
      number: tripInfo.emergencyFire,
      icon: '🚑',
      description: 'For fire or medical emergency',
      bgClass: 'bg-red-500',
    },
    {
      label: 'Tourist Helpline',
      number: tripInfo.emergencyHelpline,
      icon: '📞',
      description: 'English-speaking assistance',
      bgClass: 'bg-emerald-500',
    },
    ...(tripInfo.emergencyEmbassy ? [{
      label: 'US Embassy',
      number: tripInfo.emergencyEmbassy,
      icon: '🏛️',
      description: 'American Citizens Services',
      bgClass: 'bg-indigo-500',
    }] : []),
  ];

  return (
    <div className="fixed inset-0 z-[200]">
      {/* Backdrop */}
      <div
        className={`
          absolute inset-0 bg-black/60 backdrop-blur-sm
          transition-opacity duration-300
          ${isAnimating ? 'opacity-100' : 'opacity-0'}
        `}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="emergency-sheet-title"
        className={`
          absolute left-0 right-0
          bg-background dark:bg-surface rounded-t-3xl
          shadow-2xl
          transform transition-transform duration-300 ease-out
          ${isAnimating ? 'translate-y-0' : 'translate-y-full'}
          max-h-[85vh] overflow-y-auto
        `}
        style={{ bottom: 0 }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-foreground-tertiary/40 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 pb-4 border-b border-foreground-tertiary/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="emergency-sheet-title" className="text-xl font-bold text-foreground">
                Emergency Contacts
              </h2>
              <p className="text-sm text-foreground-secondary">Tap any number to call</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 -m-2 text-foreground-secondary hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5" style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}>
          {/* Guide Contact - Primary */}
          {tripInfo.guideName && (
            <div className="p-4 bg-gradient-to-br from-coral-50 to-amber-50 dark:from-coral-950/30 dark:to-amber-950/30 rounded-2xl border border-coral-200 dark:border-coral-800">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-coral-500 to-amber-500 rounded-full flex items-center justify-center text-2xl shadow-lg">
                  🧭
                </div>
                <div className="flex-1">
                  <p className="text-xs text-coral-600 dark:text-coral-400 uppercase tracking-wider font-medium">
                    Your Guide
                  </p>
                  <p className="text-lg font-bold text-foreground">{tripInfo.guideName}</p>
                  {tripInfo.guidePhone && (
                    <a
                      href={`tel:${tripInfo.guidePhone}`}
                      className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-coral-500 hover:bg-coral-600 text-white rounded-full font-medium text-sm transition-colors shadow-md"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                      </svg>
                      {tripInfo.guidePhone}
                    </a>
                  )}
                  {tripInfo.guideEmail && (
                    <a
                      href={`mailto:${tripInfo.guideEmail}`}
                      className="block mt-2 text-sm text-coral-600 dark:text-coral-400 hover:underline"
                    >
                      {tripInfo.guideEmail}
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Emergency Numbers Grid */}
          <div>
            <h3 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-3">
              Emergency Services
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {emergencyContacts.map((contact) => (
                <a
                  key={contact.label}
                  href={`tel:${contact.number}`}
                  className={`
                    group relative overflow-hidden
                    p-4 rounded-2xl
                    bg-surface dark:bg-background-secondary
                    border border-foreground-tertiary/20
                    hover:border-primary/40 hover:shadow-md
                    transition-all duration-200
                    active:scale-[0.98]
                  `}
                >
                  <div className={`
                    absolute top-0 right-0 w-16 h-16
                    ${contact.bgClass} opacity-10
                    rounded-full -translate-y-8 translate-x-8
                    group-hover:scale-150 transition-transform duration-300
                  `} />

                  <span className="text-2xl">{contact.icon}</span>
                  <p className="mt-2 font-bold text-foreground">{contact.label}</p>
                  <p className="text-lg font-mono font-bold text-primary">{contact.number}</p>
                  <p className="text-xs text-foreground-tertiary mt-1">{contact.description}</p>
                </a>
              ))}
            </div>
          </div>

          {/* Important note */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              <span className="font-bold">Note:</span> In Japan, 110 is for police and 119 is for fire/ambulance.
              The JNTO helpline (050-3816-2787) provides 24/7 English support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Floating emergency button - always accessible
 */
interface EmergencyButtonProps {
  onClick: () => void;
  className?: string;
}

export function EmergencyButton({ onClick, className = '' }: EmergencyButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        fixed right-4 z-[100]
        w-12 h-12 rounded-full
        bg-gradient-to-br from-red-500 to-red-600
        shadow-lg shadow-red-500/30
        flex items-center justify-center
        text-white text-xl
        hover:from-red-600 hover:to-red-700
        active:scale-95 transition-all duration-200
        ${className}
      `}
      style={{ bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px) + 1rem)' }}
      aria-label="Emergency contacts"
      title="Emergency contacts"
    >
      🆘
    </button>
  );
}

/**
 * Hook to manage emergency sheet state
 */
export function useEmergencySheet() {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, open, close, toggle };
}
