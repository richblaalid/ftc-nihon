'use client';

import { useState, useCallback } from 'react';
import { getTourContent, getCityOverview, type TourContent } from '@/db/seed-tour-content';

interface TourGuideProps {
  locationId: string;
  variant?: 'full' | 'compact';
}

/**
 * Tour Guide component that displays pre-generated or AI-generated content
 * about a location with optional text-to-speech.
 */
export function TourGuide({ locationId, variant = 'full' }: TourGuideProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Get pre-cached tour content
  const tourContent = getTourContent(locationId);

  const handleToggle = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleSpeak = useCallback(() => {
    if (!tourContent) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Create speech utterance
    const text = `${tourContent.title}. ${tourContent.content}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.lang = 'en-US';

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, [tourContent, isSpeaking]);

  if (!tourContent) {
    return null;
  }

  if (variant === 'compact') {
    return (
      <CompactTourGuide
        content={tourContent}
        isExpanded={isExpanded}
        onToggle={handleToggle}
        isSpeaking={isSpeaking}
        onSpeak={handleSpeak}
      />
    );
  }

  return (
    <FullTourGuide
      content={tourContent}
      isExpanded={isExpanded}
      onToggle={handleToggle}
      isSpeaking={isSpeaking}
      onSpeak={handleSpeak}
    />
  );
}

interface TourGuideContentProps {
  content: TourContent;
  isExpanded: boolean;
  onToggle: () => void;
  isSpeaking: boolean;
  onSpeak: () => void;
}

/**
 * Full tour guide display with all content
 */
function FullTourGuide({
  content,
  isExpanded,
  onToggle,
  isSpeaking,
  onSpeak,
}: TourGuideContentProps) {
  return (
    <div className="card">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden="true">
            {getTypeIcon(content.type)}
          </span>
          <div>
            <h3 className="font-semibold text-foreground">{content.title}</h3>
            {content.titleJapanese && (
              <p className="text-sm text-foreground-secondary">{content.titleJapanese}</p>
            )}
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-foreground-tertiary transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Listen button */}
          <button
            onClick={onSpeak}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
          >
            {isSpeaking ? (
              <>
                <StopIcon />
                Stop listening
              </>
            ) : (
              <>
                <SpeakerIcon />
                Listen to guide
              </>
            )}
          </button>

          {/* Main content */}
          <div className="text-sm text-foreground-secondary leading-relaxed whitespace-pre-line">
            {content.content}
          </div>

          {/* Highlights */}
          {content.highlights && content.highlights.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Highlights</h4>
              <ul className="space-y-1">
                {content.highlights.map((highlight, i) => (
                  <li key={i} className="text-sm text-foreground-secondary flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Etiquette tips */}
          {content.etiquetteTips && content.etiquetteTips.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2">
                Etiquette Tips
              </h4>
              <ul className="space-y-1">
                {content.etiquetteTips.map((tip, i) => (
                  <li key={i} className="text-sm text-amber-700 dark:text-amber-300 flex items-start gap-2">
                    <span className="mt-0.5">📝</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Compact tour guide for embedding in activity details
 */
function CompactTourGuide({
  content,
  isExpanded,
  onToggle,
  isSpeaking,
  onSpeak,
}: TourGuideContentProps) {
  return (
    <div className="border-t border-border pt-4 mt-4">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 text-sm text-primary hover:text-primary-hover transition-colors"
      >
        <span aria-hidden="true">{getTypeIcon(content.type)}</span>
        <span>About {content.title}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-3">
          {/* Listen button */}
          <button
            onClick={onSpeak}
            className="flex items-center gap-2 px-3 py-1.5 text-xs bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
          >
            {isSpeaking ? (
              <>
                <StopIcon className="w-3 h-3" />
                Stop
              </>
            ) : (
              <>
                <SpeakerIcon className="w-3 h-3" />
                Listen
              </>
            )}
          </button>

          <p className="text-sm text-foreground-secondary leading-relaxed">
            {content.content.split('\n\n')[0]}
          </p>

          {content.highlights && content.highlights.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {content.highlights.slice(0, 3).map((highlight, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-1 bg-background-secondary rounded-full text-foreground-secondary"
                >
                  {highlight}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * City overview component - wrapper for TourGuide with city-specific locationId
 */
export function CityOverview({ city }: { city: string }) {
  const cityContent = getCityOverview(city);

  if (!cityContent) {
    return null;
  }

  return (
    <TourGuide locationId={`city-${city.toLowerCase()}`} variant="full" />
  );
}

// Helper functions and icons
function getTypeIcon(type: TourContent['type']): string {
  switch (type) {
    case 'temple':
      return '🏯';
    case 'shrine':
      return '⛩️';
    case 'landmark':
      return '🗼';
    case 'museum':
      return '🎨';
    case 'city':
      return '🏙️';
    default:
      return '📍';
  }
}

function SpeakerIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
      />
    </svg>
  );
}

function StopIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
      />
    </svg>
  );
}
