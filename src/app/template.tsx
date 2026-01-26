'use client';

import { PageTransition } from '@/components/ui';

/**
 * Template wrapper for all pages
 * Applies page transition animations
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
