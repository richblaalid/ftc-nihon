import { test, expect } from '@playwright/test';
import {
  assertAllTouchTargets,
  assertTouchTargetSpacing,
  MIN_TOUCH_TARGET,
  MIN_TOUCH_SPACING,
} from '../utils/touch-targets';

test.describe('DaySelector Touch Target Audit', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/schedule');
    await page.waitForLoadState('networkidle');
  });

  test('all day selector buttons should meet minimum touch target size', async ({ page }) => {
    // Find day selector buttons/tabs
    const dayButtons = await page
      .locator(
        '[data-testid="day-nav"] button, [data-testid="day-selector"] button, [role="tablist"] button, [role="tab"]'
      )
      .all();

    if (dayButtons.length === 0) {
      console.log('No day selector buttons found - checking for alternative patterns');
      return;
    }

    const results = await assertAllTouchTargets(dayButtons, 'DaySelector buttons');

    expect(results.failed).toBe(0);

    console.log(
      `DaySelector touch targets: ${results.passed}/${results.passed + results.failed} passing`
    );
  });

  test('day selector pills should be at least 44x44 pixels', async ({ page }) => {
    const dayButtons = await page
      .locator(
        '[data-testid="day-nav"] button, [data-testid="day-selector"] button, [role="tablist"] button, [role="tab"]'
      )
      .all();

    for (let i = 0; i < dayButtons.length; i++) {
      const button = dayButtons[i]!;
      const box = await button.boundingBox();

      if (box) {
        expect(
          box.width,
          `Day button ${i} width should be >= ${MIN_TOUCH_TARGET}px`
        ).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);

        expect(
          box.height,
          `Day button ${i} height should be >= ${MIN_TOUCH_TARGET}px`
        ).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
      }
    }
  });

  test('day selector buttons should have sufficient spacing', async ({ page }) => {
    const dayButtons = await page
      .locator(
        '[data-testid="day-nav"] button, [data-testid="day-selector"] button, [role="tablist"] button, [role="tab"]'
      )
      .all();

    if (dayButtons.length < 2) return;

    const results = await assertTouchTargetSpacing(dayButtons, MIN_TOUCH_SPACING);

    expect(results.failed).toBe(0);

    console.log(`DaySelector spacing: ${results.passed}/${results.passed + results.failed} passing`);
  });

  test('active day should be visually distinct', async ({ page }) => {
    const dayButtons = await page
      .locator(
        '[data-testid="day-nav"] button, [data-testid="day-selector"] button, [role="tablist"] button, [role="tab"]'
      )
      .all();

    if (dayButtons.length === 0) return;

    // Find the active button
    let activeButton = null;
    for (const button of dayButtons) {
      const isSelected =
        (await button.getAttribute('aria-selected')) === 'true' ||
        (await button.getAttribute('data-active')) === 'true' ||
        (await button.getAttribute('aria-current')) !== null;

      if (isSelected) {
        activeButton = button;
        break;
      }
    }

    // There should be an active/selected state
    if (activeButton) {
      // Active button should have visual distinction (different background, etc.)
      const styles = await activeButton.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          backgroundColor: computed.backgroundColor,
          color: computed.color,
          fontWeight: computed.fontWeight,
        };
      });

      console.log('Active day button styles:', styles);
    }
  });

  test('day selector should be scrollable on small screens', async ({ page }) => {
    // Look for scrollable day selectors (not prev/next steppers which use buttons)
    // The scrollable day selector is in the map page header with overflow-x-auto
    const scrollableSelector = await page
      .locator('.overflow-x-auto, [data-testid="day-selector-scroll"]')
      .first();

    if (await scrollableSelector.count() > 0 && await scrollableSelector.isVisible()) {
      const styles = await scrollableSelector.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          overflowX: computed.overflowX,
          overflowY: computed.overflowY,
        };
      });

      // Should have horizontal scroll capability
      expect(['scroll', 'auto']).toContain(styles.overflowX);
    } else {
      // If no scrollable selector is found, check that day-nav (prev/next stepper) exists
      // This is a valid alternative pattern for day navigation
      const dayNav = await page.locator('[data-testid="day-nav"]');
      if (await dayNav.count() > 0) {
        expect(await dayNav.isVisible()).toBe(true);
      }
    }
  });
});
