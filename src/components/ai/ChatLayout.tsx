'use client';

import { type ReactNode } from 'react';
import { PageHeader } from '@/components/ui';

interface ChatLayoutProps {
  children: ReactNode;
  isOnline?: boolean;
}

/**
 * Layout wrapper for AI chat interface.
 * Provides header with offline indicator and scrollable chat area.
 */
export function ChatLayout({ children, isOnline = true }: ChatLayoutProps) {
  return (
    <div className="flex min-h-full flex-col bg-background">
      {/* Header with offline indicator */}
      <PageHeader
        title="AI Assistant"
        subtitle={!isOnline ? 'Offline mode - using cached responses' : undefined}
      />

      {/* Chat content area */}
      <div className="flex-1 flex flex-col min-h-0">
        {children}
      </div>
    </div>
  );
}
