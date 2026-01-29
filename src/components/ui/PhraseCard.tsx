'use client';

import { useState } from 'react';
import type { Phrase } from '@/types/database';

interface PhraseCardProps {
  phrase: Phrase;
  className?: string;
  expanded?: boolean;
}

/**
 * Japanese phrase card with pronunciation and context
 * Designed for quick reference during the trip
 */
export function PhraseCard({ phrase, className = '', expanded = false }: PhraseCardProps) {
  const [isExpanded, setIsExpanded] = useState(expanded);

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl
        bg-gradient-to-br from-rose-50 via-white to-pink-50
        dark:from-rose-950/30 dark:via-surface dark:to-pink-950/30
        border border-rose-200 dark:border-rose-800/50
        shadow-sm
        transition-all duration-200
        ${className}
      `}
    >
      {/* Decorative Japanese pattern overlay */}
      <div
        className="absolute top-0 right-0 w-20 h-20 opacity-5 dark:opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2.5a2.5 2.5 0 015 0V16h15v2H25v2.5a2.5 2.5 0 01-5 0z' fill='%23c93c3c' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        }}
      />

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-4"
        aria-expanded={isExpanded}
      >
        {/* English meaning - large and prominent for English speakers */}
        <p className="text-xl font-bold text-foreground leading-tight">
          {phrase.meaning}
        </p>

        {/* Japanese text */}
        <p className="text-2xl font-bold text-primary mt-2 leading-tight" lang="ja">
          {phrase.japanese}
        </p>

        {/* Romaji pronunciation */}
        {phrase.romaji && (
          <p className="text-base text-foreground-secondary mt-1 italic">
            {phrase.romaji}
          </p>
        )}

        {/* Expand indicator */}
        <div className="flex items-center justify-between mt-3">
          <span
            className={`
              inline-flex items-center gap-1 px-2 py-0.5 rounded-full
              text-xs font-medium
              bg-rose-100 dark:bg-rose-900/40
              text-rose-700 dark:text-rose-300
            `}
          >
            {phrase.category}
          </span>

          <svg
            className={`w-5 h-5 text-foreground-tertiary transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded section with usage context */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-rose-200 dark:border-rose-800/50">
          <div className="pt-3">
            <p className="text-xs font-medium text-foreground-tertiary uppercase tracking-wider mb-2">
              When to use
            </p>
            <p className="text-sm text-foreground-secondary bg-rose-50 dark:bg-rose-950/50 p-3 rounded-lg">
              💡 {phrase.when}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact phrase display for lists
 */
export function PhraseCardCompact({ phrase, className = '' }: Omit<PhraseCardProps, 'expanded'>) {
  return (
    <div
      className={`
        flex items-center gap-3 p-3 rounded-lg
        bg-rose-50 dark:bg-rose-950/30
        border border-rose-100 dark:border-rose-900/50
        ${className}
      `}
    >
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{phrase.meaning}</p>
        <p className="text-base font-bold text-primary truncate" lang="ja">{phrase.japanese}</p>
      </div>
      {phrase.romaji && (
        <span className="shrink-0 text-xs text-foreground-secondary italic">
          {phrase.romaji}
        </span>
      )}
    </div>
  );
}

/**
 * Phrase grid for category display
 */
interface PhraseGridProps {
  phrases: Phrase[];
  className?: string;
  compact?: boolean;
}

export function PhraseGrid({ phrases, className = '', compact = false }: PhraseGridProps) {
  if (phrases.length === 0) {
    return (
      <div className="text-center py-8 text-foreground-tertiary">
        <span className="text-3xl">🗾</span>
        <p className="mt-2">No phrases available</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`space-y-2 ${className}`}>
        {phrases.map((phrase) => (
          <PhraseCardCompact key={phrase.id} phrase={phrase} />
        ))}
      </div>
    );
  }

  return (
    <div className={`grid gap-3 ${className}`}>
      {phrases.map((phrase) => (
        <PhraseCard key={phrase.id} phrase={phrase} />
      ))}
    </div>
  );
}

/**
 * Quick phrase lookup - shows a phrase prominently
 */
interface QuickPhraseProps {
  phrase: Phrase;
  onClose?: () => void;
  className?: string;
}

export function QuickPhrase({ phrase, onClose, className = '' }: QuickPhraseProps) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl p-6
        bg-gradient-to-br from-rose-500 via-pink-500 to-red-500
        text-white shadow-xl
        ${className}
      `}
    >
      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Category badge */}
      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/20 text-xs font-medium mb-4">
        {phrase.category}
      </span>

      {/* Japanese - hero text */}
      <p className="text-4xl font-bold leading-tight mb-2">
        {phrase.japanese}
      </p>

      {/* Romaji */}
      {phrase.romaji && (
        <p className="text-lg text-white/80 italic mb-4">
          {phrase.romaji}
        </p>
      )}

      {/* Divider */}
      <div className="h-px bg-white/20 my-4" />

      {/* English meaning */}
      <p className="text-xl font-medium mb-2">
        {phrase.meaning}
      </p>

      {/* Context */}
      <p className="text-sm text-white/70">
        📍 {phrase.when}
      </p>
    </div>
  );
}
