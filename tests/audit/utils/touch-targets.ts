import { Locator, expect } from '@playwright/test';

/**
 * Minimum touch target size per WCAG 2.1 AA and Apple HIG (44x44 CSS pixels)
 */
export const MIN_TOUCH_TARGET = 44;

/**
 * Minimum spacing between touch targets (8px per Design System)
 */
export const MIN_TOUCH_SPACING = 8;

/**
 * Check if an element meets minimum touch target size
 */
export async function assertTouchTargetSize(
  locator: Locator,
  options: { minWidth?: number; minHeight?: number } = {}
): Promise<{ width: number; height: number; passes: boolean }> {
  const minWidth = options.minWidth ?? MIN_TOUCH_TARGET;
  const minHeight = options.minHeight ?? MIN_TOUCH_TARGET;

  const boundingBox = await locator.boundingBox();

  if (!boundingBox) {
    throw new Error('Element not visible or has no bounding box');
  }

  const { width, height } = boundingBox;
  const passes = width >= minWidth && height >= minHeight;

  return { width, height, passes };
}

/**
 * Assert all elements in a locator meet touch target requirements
 */
export async function assertAllTouchTargets(
  locators: Locator[],
  description: string
): Promise<{
  passed: number;
  failed: number;
  failures: Array<{ index: number; width: number; height: number; html: string }>;
}> {
  const failures: Array<{ index: number; width: number; height: number; html: string }> = [];
  let passed = 0;
  let failed = 0;

  for (let i = 0; i < locators.length; i++) {
    const locator = locators[i]!;
    try {
      const { width, height, passes } = await assertTouchTargetSize(locator);
      const html = await locator.evaluate((el: Element) => el.outerHTML.slice(0, 100));

      if (passes) {
        passed++;
      } else {
        failed++;
        failures.push({ index: i, width, height, html });
      }
    } catch (error) {
      // Element not visible, skip
      continue;
    }
  }

  if (failures.length > 0) {
    console.log(`Touch target failures for ${description}:`, JSON.stringify(failures, null, 2));
  }

  return { passed, failed, failures };
}

/**
 * Check spacing between adjacent touch targets
 */
export async function assertTouchTargetSpacing(
  locators: Locator[],
  minSpacing: number = MIN_TOUCH_SPACING
): Promise<{
  passed: number;
  failed: number;
  failures: Array<{ index: number; spacing: number }>;
}> {
  const failures: Array<{ index: number; spacing: number }> = [];
  let passed = 0;
  let failed = 0;

  for (let i = 0; i < locators.length - 1; i++) {
    const current = await locators[i]!.boundingBox();
    const next = await locators[i + 1]!.boundingBox();

    if (!current || !next) continue;

    // Calculate horizontal or vertical spacing (whichever is smaller)
    const horizontalSpacing = Math.abs(next.x - (current.x + current.width));
    const verticalSpacing = Math.abs(next.y - (current.y + current.height));

    // Check if they're adjacent (one spacing should be near 0)
    const isHorizontallyAdjacent = Math.abs(current.y - next.y) < current.height / 2;
    const isVerticallyAdjacent = Math.abs(current.x - next.x) < current.width / 2;

    let spacing = Infinity;
    if (isHorizontallyAdjacent) {
      spacing = horizontalSpacing;
    } else if (isVerticallyAdjacent) {
      spacing = verticalSpacing;
    }

    if (spacing !== Infinity) {
      if (spacing >= minSpacing) {
        passed++;
      } else {
        failed++;
        failures.push({ index: i, spacing });
      }
    }
  }

  return { passed, failed, failures };
}

/**
 * Generate a touch target audit report for a set of elements
 */
export async function auditTouchTargets(
  locators: Locator[],
  description: string
): Promise<string> {
  const sizeResults = await assertAllTouchTargets(locators, description);
  const spacingResults = await assertTouchTargetSpacing(locators);

  const lines = [
    `## Touch Target Audit: ${description}`,
    '',
    `### Size Compliance (min ${MIN_TOUCH_TARGET}x${MIN_TOUCH_TARGET}px)`,
    `- Passed: ${sizeResults.passed}`,
    `- Failed: ${sizeResults.failed}`,
    '',
  ];

  if (sizeResults.failures.length > 0) {
    lines.push('**Size Failures:**');
    for (const failure of sizeResults.failures) {
      lines.push(`- Element ${failure.index}: ${failure.width}x${failure.height}px`);
      lines.push(`  \`${failure.html}\``);
    }
    lines.push('');
  }

  lines.push(`### Spacing Compliance (min ${MIN_TOUCH_SPACING}px)`);
  lines.push(`- Passed: ${spacingResults.passed}`);
  lines.push(`- Failed: ${spacingResults.failed}`);

  if (spacingResults.failures.length > 0) {
    lines.push('');
    lines.push('**Spacing Failures:**');
    for (const failure of spacingResults.failures) {
      lines.push(`- Between elements ${failure.index} and ${failure.index + 1}: ${failure.spacing}px`);
    }
  }

  return lines.join('\n');
}
