'use client';

import { type ReactNode } from 'react';
import { PageHeader } from '@/components/ui';

interface ChatLayoutProps {
  children: ReactNode;
  isOnline?: boolean;
  onClearHistory?: () => void;
}

/**
 * Layout wrapper for AI chat interface.
 * Provides header with offline indicator and scrollable chat area.
 */
export function ChatLayout({ children, isOnline = true, onClearHistory }: ChatLayoutProps) {
  return (
    <div className="flex min-h-full flex-col bg-background">
      {/* Header with offline indicator */}
      <PageHeader
        title="AI Assistant"
        subtitle={!isOnline ? 'Offline mode - using cached responses' : undefined}
        rightAction={
          onClearHistory ? (
            <button
              onClick={onClearHistory}
              aria-label="Clear chat history"
              className="p-2 rounded-lg text-foreground-secondary hover:bg-background-secondary transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          ) : undefined
        }
      />

      {/* Chat content area */}
      <div className="flex-1 flex flex-col min-h-0">
        {children}
      </div>
    </div>
  );
}
