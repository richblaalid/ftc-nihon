import { test as base, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Extended test fixtures for accessibility auditing
 */
export const test = base.extend<{
  makeAxeBuilder: () => AxeBuilder;
}>({
  makeAxeBuilder: async ({ page }, use) => {
    const makeAxeBuilder = () =>
      new AxeBuilder({ page })
        // Exclude known third-party elements that we can't control
        .exclude('#__next-build-watcher')
        // Focus on WCAG 2.1 AA compliance
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']);

    await use(makeAxeBuilder);
  },
});

export { expect };

/**
 * Helper to format axe violations for readable output
 */
export function formatViolations(violations: AxeBuilder['analyze'] extends () => Promise<infer R> ? R extends { violations: infer V } ? V : never : never) {
  return violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    description: violation.description,
    helpUrl: violation.helpUrl,
    nodes: violation.nodes.map((node) => ({
      html: node.html,
      failureSummary: node.failureSummary,
    })),
  }));
}

/**
 * Minimum touch target size per WCAG 2.1 AA (44x44 CSS pixels)
 */
export const MIN_TOUCH_TARGET = 44;

/**
 * Minimum spacing between touch targets (8px)
 */
export const MIN_TOUCH_SPACING = 8;
