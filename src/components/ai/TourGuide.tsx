'use client';

import { useState, useCallback } from 'react';
import { getTourContent, getCityOverview, type TourContent } from '@/db/seed-tour-content';
import { useAudioPlayer, formatTime } from '@/lib/use-audio-player';

interface TourGuideProps {
  locationId: string;
  variant?: 'full' | 'compact';
  defaultExpanded?: boolean;
}

/**
 * Tour Guide component that displays pre-generated content
 * about a location with audio playback (pre-generated MP3 or Web Speech API fallback).
 */
export function TourGuide({ locationId, variant = 'full', defaultExpanded = false }: TourGuideProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const tourContent = getTourContent(locationId);

  const handleToggle = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  if (!tourContent) {
    return null;
  }

  if (variant === 'compact') {
    return (
      <CompactTourGuide
        content={tourContent}
        isExpanded={isExpanded}
      />
    );
  }

  return (
    <FullTourGuide
      content={tourContent}
      isExpanded={isExpanded}
      onToggle={handleToggle}
    />
  );
}

interface TourGuideContentProps {
  content: TourContent;
  isExpanded: boolean;
  onToggle: () => void;
}

/**
 * Full tour guide display with all content
 */
function FullTourGuide({
  content,
  isExpanded,
  onToggle,
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
          {/* Audio player */}
          <AudioControls content={content} variant="full" />

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
 * Compact tour guide for embedding in activity details.
 * Expansion is controlled by the parent via defaultExpanded/isExpanded.
 */
function CompactTourGuide({
  content,
  isExpanded,
}: Omit<TourGuideContentProps, 'onToggle'>) {
  if (!isExpanded) return null;

  return (
    <div className="space-y-3">
      {/* Title */}
      <div className="flex items-center gap-2 text-sm text-foreground-secondary">
        <span aria-hidden="true">{getTypeIcon(content.type)}</span>
        <span className="font-medium">About {content.title}</span>
      </div>

      {/* Audio player */}
      <AudioControls content={content} variant="compact" />

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
  );
}

/**
 * Audio controls with HTML5 Audio player (pre-generated MP3) or Web Speech API fallback.
 */
function AudioControls({
  content,
  variant,
}: {
  content: TourContent;
  variant: 'full' | 'compact';
}) {
  if (content.audioUrl) {
    return (
      <Html5AudioPlayer
        audioUrl={content.audioUrl}
        duration={content.audioDurationSeconds}
        variant={variant}
      />
    );
  }

  return <SpeechFallbackPlayer content={content} variant={variant} />;
}

/**
 * HTML5 Audio player with progress bar and controls.
 */
function Html5AudioPlayer({
  audioUrl,
  duration: fallbackDuration,
  variant,
}: {
  audioUrl: string;
  duration?: number;
  variant: 'full' | 'compact';
}) {
  const player = useAudioPlayer(audioUrl, fallbackDuration);

  const progress = player.duration > 0 ? (player.currentTime / player.duration) * 100 : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (player.duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    player.seek(pct * player.duration);
  };

  return (
    <div className="space-y-2">
      {/* Controls row */}
      <div className="flex items-center gap-2">
        {/* Skip back (full variant only) */}
        {variant === 'full' && (
          <button
            onClick={() => player.skipBackward(15)}
            aria-label="Skip back 15 seconds"
            className="min-w-touch min-h-touch flex items-center justify-center text-foreground-tertiary hover:text-foreground transition-colors"
          >
            <SkipBackIcon />
          </button>
        )}

        {/* Play/Pause button */}
        <button
          onClick={player.toggle}
          aria-label={player.isPlaying ? 'Pause' : 'Play tour guide'}
          className="min-w-touch min-h-touch flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          {player.isLoading ? (
            <LoadingSpinner />
          ) : player.isPlaying ? (
            <PauseIcon />
          ) : (
            <PlayIcon />
          )}
        </button>

        {/* Skip forward (full variant only) */}
        {variant === 'full' && (
          <button
            onClick={() => player.skipForward(15)}
            aria-label="Skip forward 15 seconds"
            className="min-w-touch min-h-touch flex items-center justify-center text-foreground-tertiary hover:text-foreground transition-colors"
          >
            <SkipForwardIcon />
          </button>
        )}

        {/* Label (compact only, when not playing) */}
        {variant === 'compact' && !player.isPlaying && !player.isLoading && (
          <button
            onClick={player.toggle}
            className="text-sm text-primary"
          >
            Listen to guide
          </button>
        )}

        {/* Time display */}
        <span className="text-xs text-foreground-tertiary ml-auto tabular-nums">
          {formatTime(player.currentTime)} / {formatTime(player.duration)}
        </span>
      </div>

      {/* Progress bar */}
      <div
        onClick={handleProgressClick}
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Audio progress"
        className="h-1.5 bg-background-secondary rounded-full cursor-pointer overflow-hidden"
      >
        <div
          className="h-full bg-primary rounded-full transition-[width] duration-200 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Error message */}
      {player.error && (
        <p className="text-xs text-red-500">{player.error}</p>
      )}
    </div>
  );
}

/**
 * Fallback player using Web Speech API when no pre-generated audio available.
 */
function SpeechFallbackPlayer({
  content,
  variant,
}: {
  content: TourContent;
  variant: 'full' | 'compact';
}) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = useCallback(() => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const text = `${content.title}. ${content.content}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.lang = 'en-US';

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, [content, isSpeaking]);

  if (!('speechSynthesis' in globalThis)) {
    return null;
  }

  const isCompact = variant === 'compact';

  return (
    <button
      onClick={handleSpeak}
      className={`flex items-center gap-2 ${
        isCompact ? 'px-3 py-1.5 text-xs' : 'px-3 py-2 text-sm'
      } bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors`}
    >
      {isSpeaking ? (
        <>
          <StopIcon className={isCompact ? 'w-3 h-3' : 'w-4 h-4'} />
          {isCompact ? 'Stop' : 'Stop listening'}
        </>
      ) : (
        <>
          <SpeakerIcon className={isCompact ? 'w-3 h-3' : 'w-4 h-4'} />
          {isCompact ? 'Listen' : 'Listen to guide'}
        </>
      )}
    </button>
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

function PlayIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}

function SkipBackIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
    </svg>
  );
}

function SkipForwardIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
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
