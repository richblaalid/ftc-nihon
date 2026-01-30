'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { PhraseListContent, PhraseCategoryTabs } from '@/components/phrases/PhraseList';
import type { PhraseCategory } from '@/db/seed-phrases';

export default function PhrasesPage() {
  const [selectedCategory, setSelectedCategory] = useState<PhraseCategory | 'all'>('all');

  return (
    <div className="flex min-h-full flex-col bg-background">
      <PageHeader title="Japanese Phrases" backHref="/">
        <PhraseCategoryTabs
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </PageHeader>

      <main className="flex-1 px-4 pb-4">
        <div className="mx-auto max-w-lg py-4">
          <p className="text-sm text-foreground-secondary mb-4">
            Tap any phrase to see it larger for showing to staff.
          </p>
          <PhraseListContent selectedCategory={selectedCategory} />
        </div>
      </main>
    </div>
  );
}
