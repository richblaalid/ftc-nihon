import { test, expect } from '@playwright/test';
import {
  assertAllTouchTargets,
  MIN_TOUCH_TARGET,
} from '../utils/touch-targets';

test.describe('QuickActions Touch Target Audit', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('all quick action buttons should meet minimum touch target size', async ({ page }) => {
    // Find quick action buttons (they're typically in a grid/flex container on dashboard)
    const quickActionButtons = await page
      .locator('[data-testid="quick-actions"] button, .quick-actions button, section button')
      .all();

    if (quickActionButtons.length === 0) {
      // Try finding buttons that look like quick actions
      const allButtons = await page.locator('button').all();
      console.log(`Found ${allButtons.length} total buttons on dashboard`);
      return;
    }

    const results = await assertAllTouchTargets(quickActionButtons, 'QuickActions buttons');

    expect(results.failed).toBe(0);

    console.log(
      `QuickActions touch targets: ${results.passed}/${results.passed + results.failed} passing`
    );
  });

  test('quick action buttons should be at least 44x44 pixels', async ({ page }) => {
    const buttons = await page
      .locator('[data-testid="quick-actions"] button, .quick-actions button')
      .all();

    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i]!;
      const box = await button.boundingBox();

      if (box) {
        expect(
          box.width,
          `QuickAction ${i} width should be >= ${MIN_TOUCH_TARGET}px`
        ).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);

        expect(
          box.height,
          `QuickAction ${i} height should be >= ${MIN_TOUCH_TARGET}px`
        ).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
      }
    }
  });

  test('quick action touch targets should be consistent size', async ({ page }) => {
    const buttons = await page
      .locator('[data-testid="quick-actions"] button, .quick-actions button')
      .all();

    if (buttons.length < 2) return;

    const sizes: Array<{ width: number; height: number }> = [];

    for (const button of buttons) {
      const box = await button.boundingBox();
      if (box) {
        sizes.push({ width: box.width, height: box.height });
      }
    }

    // All buttons should be roughly the same size (within 10% variance)
    if (sizes.length > 1) {
      const avgWidth = sizes.reduce((sum, s) => sum + s.width, 0) / sizes.length;
      const avgHeight = sizes.reduce((sum, s) => sum + s.height, 0) / sizes.length;

      for (const size of sizes) {
        expect(Math.abs(size.width - avgWidth) / avgWidth).toBeLessThan(0.1);
        expect(Math.abs(size.height - avgHeight) / avgHeight).toBeLessThan(0.1);
      }
    }
  });
});
