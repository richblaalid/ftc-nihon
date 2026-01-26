import { test, expect, formatViolations } from '../fixtures';

test.describe('Map Page Accessibility Audit', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/map');
    await page.waitForLoadState('networkidle');
  });

  test('should have no accessibility violations', async ({ page, makeAxeBuilder }) => {
    const accessibilityScanResults = await makeAxeBuilder()
      // Exclude map container which is third-party Google Maps
      .exclude('.gm-style')
      .exclude('[aria-label*="Map"]')
      .analyze();

    if (accessibilityScanResults.violations.length > 0) {
      console.log(
        'Map page a11y violations:',
        JSON.stringify(formatViolations(accessibilityScanResults.violations), null, 2)
      );
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have accessible map controls', async ({ page }) => {
    // Map controls (zoom, etc.) should have accessible names
    const controls = await page
      .locator('button:not(.gm-style button), [role="button"]:not(.gm-style [role="button"])')
      .all();

    for (const control of controls) {
      const accessibleName =
        (await control.getAttribute('aria-label')) ||
        (await control.getAttribute('title')) ||
        (await control.innerText());
      expect(accessibleName.trim().length).toBeGreaterThan(0);
    }
  });

  test('should have accessible pin information', async ({ page }) => {
    // If there's a pin info popup, it should be accessible
    const pinInfo = await page.locator('[data-testid="pin-info"], .pin-info').first();

    if (await pinInfo.isVisible()) {
      // Pin info should have proper structure
      const hasContent =
        (await pinInfo.locator('h1, h2, h3, h4, p').count()) > 0;
      expect(hasContent).toBe(true);
    }
  });

  test('should have accessible navigation buttons', async ({ page }) => {
    // Direction/navigation buttons should be labeled
    const navButtons = await page
      .locator('button[data-testid*="direction"], button[data-testid*="navigate"]')
      .all();

    for (const button of navButtons) {
      const accessibleName =
        (await button.getAttribute('aria-label')) ||
        (await button.innerText());
      expect(accessibleName.trim().length).toBeGreaterThan(0);
    }
  });

  test('should have error state accessibility', async ({ page }) => {
    // If map fails to load, error should be accessible
    const errorMessage = await page.locator('[role="alert"], .error-message').first();

    if (await errorMessage.isVisible()) {
      const hasRole = await errorMessage.getAttribute('role');
      expect(hasRole).toBe('alert');
    }
  });

  test('should support keyboard navigation for controls', async ({ page }) => {
    // Tab should move focus to map controls
    await page.keyboard.press('Tab');

    const focusedElement = await page.locator(':focus').first();
    if (await focusedElement.isVisible()) {
      // Focus should be visible
      const isInteractive = await focusedElement.evaluate((el) => {
        const tagName = el.tagName.toLowerCase();
        return (
          tagName === 'button' ||
          tagName === 'a' ||
          el.getAttribute('role') === 'button' ||
          el.getAttribute('tabindex') !== null
        );
      });
      expect(isInteractive).toBe(true);
    }
  });
});
