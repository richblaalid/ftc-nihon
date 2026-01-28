'use client';

import { useState } from 'react';
import type { Accommodation } from '@/types/database';

interface AccommodationCardProps {
  accommodation: Accommodation;
  isCurrent?: boolean;
}

/**
 * Accommodation card with expandable details
 * Shows hotel info, addresses, and contact details
 */
export function AccommodationCard({ accommodation, isCurrent = false }: AccommodationCardProps) {
  const [isExpanded, setIsExpanded] = useState(isCurrent);
  const [copied, setCopied] = useState(false);

  // Format date range (parse as local date to avoid timezone issues)
  const formatDateRange = () => {
    // Parse YYYY-MM-DD as local date (add T12:00 to avoid UTC midnight issues)
    const parseLocalDate = (dateStr: string) => {
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(year!, month! - 1, day!);
    };
    const start = parseLocalDate(accommodation.startDate);
    const end = parseLocalDate(accommodation.endDate);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  };

  // Format time
  const formatTime = (time: string | null) => {
    if (!time) return null;
    const parts = time.split(':');
    const hoursStr = parts[0];
    const minutesStr = parts[1];
    if (!hoursStr || !minutesStr) return time;
    const h = parseInt(hoursStr, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutesStr} ${ampm}`;
  };

  // Copy Japanese address to clipboard
  const copyJapaneseAddress = async () => {
    const textToCopy = accommodation.addressJp || accommodation.address;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Build Google Maps URL
  const getGoogleMapsUrl = () => {
    if (accommodation.googleMapsUrl) return accommodation.googleMapsUrl;
    const address = encodeURIComponent(accommodation.addressJp || accommodation.address);
    return `https://www.google.com/maps/search/?api=1&query=${address}`;
  };

  return (
    <div
      className={`card overflow-hidden transition-all ${
        isCurrent ? 'ring-2 ring-primary' : ''
      }`}
    >
      {/* Header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-4 flex items-start justify-between gap-3"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏨</span>
            <h3 className="font-semibold text-foreground truncate">{accommodation.name}</h3>
          </div>
          <p className="text-sm text-foreground-secondary mt-1">{formatDateRange()}</p>
          {isCurrent && (
            <span className="inline-block mt-2 px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
              Current Stay
            </span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-foreground-tertiary transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded details */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
          {/* Check-in/Check-out times */}
          <div className="flex gap-4">
            {accommodation.checkInTime && (
              <div>
                <p className="text-xs text-foreground-tertiary">Check-in</p>
                <p className="text-sm font-medium">{formatTime(accommodation.checkInTime)}</p>
              </div>
            )}
            {accommodation.checkOutTime && (
              <div>
                <p className="text-xs text-foreground-tertiary">Check-out</p>
                <p className="text-sm font-medium">{formatTime(accommodation.checkOutTime)}</p>
              </div>
            )}
          </div>

          {/* Confirmation number */}
          {accommodation.confirmationNumber && (
            <div>
              <p className="text-xs text-foreground-tertiary">Confirmation #</p>
              <p className="text-sm font-mono font-medium">{accommodation.confirmationNumber}</p>
            </div>
          )}

          {/* PIN code */}
          {accommodation.pinCode && (
            <div>
              <p className="text-xs text-foreground-tertiary">PIN / Access Code</p>
              <p className="text-sm font-mono font-bold text-primary">{accommodation.pinCode}</p>
            </div>
          )}

          {/* English address */}
          <div>
            <p className="text-xs text-foreground-tertiary">Address</p>
            <p className="text-sm">{accommodation.address}</p>
          </div>

          {/* Japanese address with copy button */}
          {accommodation.addressJp && (
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-foreground-tertiary">Japanese Address (for taxi)</p>
                <button
                  onClick={copyJapaneseAddress}
                  className="text-xs text-primary hover:text-primary-hover flex items-center gap-1"
                >
                  {copied ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>
              <p className="text-sm mt-1" lang="ja">{accommodation.addressJp}</p>
            </div>
          )}

          {/* Special instructions */}
          {accommodation.instructions && (
            <div className="bg-background-secondary rounded-lg p-3">
              <p className="text-xs text-foreground-tertiary mb-1">Special Instructions</p>
              <p className="text-sm whitespace-pre-wrap">{accommodation.instructions}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            {/* Phone */}
            {accommodation.phone && (
              <a
                href={`tel:${accommodation.phone}`}
                className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call
              </a>
            )}

            {/* Directions */}
            <a
              href={getGoogleMapsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              Directions
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
