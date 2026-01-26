import { test, expect } from '@playwright/test';
import {
  assertAllTouchTargets,
  assertTouchTargetSpacing,
  MIN_TOUCH_TARGET,
  MIN_TOUCH_SPACING,
} from '../utils/touch-targets';

test.describe('BottomNav Touch Target Audit', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('all nav items should meet minimum touch target size', async ({ page }) => {
    // Find bottom nav items
    const navItems = await page.locator('nav a, nav button, [role="navigation"] a').all();

    expect(navItems.length).toBeGreaterThan(0);

    const results = await assertAllTouchTargets(navItems, 'BottomNav items');

    // All items should pass
    expect(results.failed).toBe(0);

    // Log detailed results for audit
    console.log(`BottomNav touch targets: ${results.passed}/${results.passed + results.failed} passing`);
  });

  test('nav items should have sufficient spacing', async ({ page }) => {
    const navItems = await page.locator('nav a, nav button, [role="navigation"] a').all();

    const results = await assertTouchTargetSpacing(navItems, MIN_TOUCH_SPACING);

    // All spacing should pass
    expect(results.failed).toBe(0);

    console.log(`BottomNav spacing: ${results.passed}/${results.passed + results.failed} passing`);
  });

  test('each nav item should be at least 44x44 pixels', async ({ page }) => {
    const navItems = await page.locator('nav a, nav button, [role="navigation"] a').all();

    for (let i = 0; i < navItems.length; i++) {
      const item = navItems[i]!;
      const box = await item.boundingBox();

      if (box) {
        expect(
          box.width,
          `Nav item ${i} width should be >= ${MIN_TOUCH_TARGET}px`
        ).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);

        expect(
          box.height,
          `Nav item ${i} height should be >= ${MIN_TOUCH_TARGET}px`
        ).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
      }
    }
  });

  test('bottom nav should have proper safe area handling', async ({ page }) => {
    // Check that nav is positioned at bottom with safe area consideration
    const nav = await page.locator('nav, [role="navigation"]').first();
    const navBox = await nav.boundingBox();
    const viewport = page.viewportSize();

    if (navBox && viewport) {
      // Nav should be at bottom of viewport
      expect(navBox.y + navBox.height).toBeGreaterThanOrEqual(viewport.height - 100);

      // Nav should have minimum height (64px per Design System + safe area)
      expect(navBox.height).toBeGreaterThanOrEqual(64);
    }
  });
});
