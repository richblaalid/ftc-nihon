'use client';

import { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
  header?: ReactNode;
}

/**
 * Dashboard grid layout - mobile-first single column
 * Provides consistent spacing and safe area handling
 */
export function DashboardLayout({ children, header }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header area with safe area inset */}
      {header && (
        <header className="sticky top-0 z-10 bg-background/95 px-4 pb-2 pt-safe backdrop-blur-sm">
          {header}
        </header>
      )}

      {/* Main content area */}
      <main className="flex-1 px-4 pb-safe">
        <div className="mx-auto flex max-w-lg flex-col gap-4">{children}</div>
      </main>
    </div>
  );
}
