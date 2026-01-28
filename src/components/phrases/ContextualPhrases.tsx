'use client';

import Link from 'next/link';
import { usePhrasesByCategory } from '@/db/hooks';
import { PhraseCardCompact } from '@/components/ui/PhraseCard';
import type { ActivityCategory } from '@/types/database';

/**
 * Map activity categories to phrase categories
 */
function getPhraseCategory(activityCategory: ActivityCategory): string | null {
  const mapping: Record<ActivityCategory, string | null> = {
    food: 'restaurant',
    temple: 'temple',
    shopping: 'shopping',
    hotel: 'hotel',
    transit: 'transit',
    activity: null, // General activities don't have specific phrases
  };
  return mapping[activityCategory];
}

interface ContextualPhrasesProps {
  activityCategory: ActivityCategory;
  /** Number of phrases to show in preview */
  limit?: number;
}

/**
 * Contextual phrases preview for activity detail pages
 * Shows 2-3 relevant phrases based on activity category
 */
export function ContextualPhrases({ activityCategory, limit = 3 }: ContextualPhrasesProps) {
  const phraseCategory = getPhraseCategory(activityCategory);
  const phrases = usePhrasesByCategory(phraseCategory || '');

  // Don't render if no relevant category or no phrases
  if (!phraseCategory || !phrases || phrases.length === 0) {
    return null;
  }

  // Get first N phrases for preview
  const previewPhrases = phrases.slice(0, limit);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider flex items-center gap-2">
          <span>🗣️</span>
          Useful Phrases
        </h3>
        <Link
          href="/phrases"
          className="text-xs font-medium text-primary hover:text-primary-hover transition-colors"
        >
          See all →
        </Link>
      </div>

      <div className="space-y-2">
        {previewPhrases.map((phrase) => (
          <PhraseCardCompact key={phrase.id} phrase={phrase} />
        ))}
      </div>
    </div>
  );
}

/**
 * Get category label for display
 */
export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    restaurant: 'Restaurant',
    transit: 'Transit',
    shopping: 'Shopping',
    temple: 'Temple & Shrine',
    hotel: 'Hotel',
    emergency: 'Emergency',
  };
  return labels[category] || category;
}
