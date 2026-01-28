'use client';

import { PageHeader } from '@/components/ui/PageHeader';
import { PhraseList } from '@/components/phrases/PhraseList';

export default function PhrasesPage() {
  return (
    <div className="flex h-full flex-col bg-background">
      <PageHeader title="Japanese Phrases" backHref="/" />

      <main className="flex-1 px-4 pb-safe overflow-y-auto">
        <div className="mx-auto max-w-lg py-4">
          <p className="text-sm text-foreground-secondary mb-4">
            Tap any phrase to see it larger for showing to staff.
          </p>
          <PhraseList />
        </div>
      </main>
    </div>
  );
}
