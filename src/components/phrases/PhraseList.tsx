'use client';

import { useState } from 'react';
import { usePhrases } from '@/db/hooks';
import { PhraseCard } from '@/components/ui/PhraseCard';
import { PHRASE_CATEGORIES, type PhraseCategory } from '@/db/seed-phrases';

/**
 * Phrase list with category tabs
 * Shows all Japanese phrases organized by category
 */
export function PhraseList() {
  const [selectedCategory, setSelectedCategory] = useState<PhraseCategory | 'all'>('all');
  const allPhrases = usePhrases();

  // Filter phrases by category
  const filteredPhrases = allPhrases?.filter(
    (phrase) => selectedCategory === 'all' || phrase.category === selectedCategory
  );

  return (
    <div className="space-y-4">
      {/* Category tabs - horizontal scroll */}
      <div className="overflow-x-auto -mx-4 px-4 pb-2">
        <div className="flex gap-2 min-w-max">
          <CategoryTab
            label="All"
            icon="📚"
            isActive={selectedCategory === 'all'}
            onClick={() => setSelectedCategory('all')}
          />
          {PHRASE_CATEGORIES.map((cat) => (
            <CategoryTab
              key={cat.id}
              label={cat.label}
              icon={cat.icon}
              isActive={selectedCategory === cat.id}
              onClick={() => setSelectedCategory(cat.id)}
            />
          ))}
        </div>
      </div>

      {/* Phrases list */}
      <div className="space-y-3">
        {!filteredPhrases ? (
          // Loading state
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse p-4">
                <div className="h-6 w-32 bg-background-secondary rounded" />
                <div className="h-4 w-48 bg-background-secondary rounded mt-2" />
              </div>
            ))}
          </div>
        ) : filteredPhrases.length === 0 ? (
          <div className="text-center py-12 text-foreground-tertiary">
            <span className="text-4xl">🗾</span>
            <p className="mt-2">No phrases in this category</p>
          </div>
        ) : (
          filteredPhrases.map((phrase) => (
            <PhraseCard key={phrase.id} phrase={phrase} />
          ))
        )}
      </div>
    </div>
  );
}

interface CategoryTabProps {
  label: string;
  icon: string;
  isActive: boolean;
  onClick: () => void;
}

function CategoryTab({ label, icon, isActive, onClick }: CategoryTabProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-full
        text-sm font-medium whitespace-nowrap
        transition-all duration-200
        ${
          isActive
            ? 'bg-primary text-white shadow-md'
            : 'bg-background-secondary text-foreground-secondary hover:bg-background-tertiary'
        }
      `}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
