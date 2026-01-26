import { test, expect, formatViolations } from '../fixtures';

test.describe('Schedule Page Accessibility Audit', () => {
  test('should have no accessibility violations on default schedule', async ({
    page,
    makeAxeBuilder,
  }) => {
    await page.goto('/schedule');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await makeAxeBuilder().analyze();

    if (accessibilityScanResults.violations.length > 0) {
      console.log(
        'Schedule page a11y violations:',
        JSON.stringify(formatViolations(accessibilityScanResults.violations), null, 2)
      );
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have no accessibility violations on day 1', async ({
    page,
    makeAxeBuilder,
  }) => {
    await page.goto('/schedule?day=1');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await makeAxeBuilder().analyze();

    if (accessibilityScanResults.violations.length > 0) {
      console.log(
        'Schedule day 1 a11y violations:',
        JSON.stringify(formatViolations(accessibilityScanResults.violations), null, 2)
      );
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have accessible day navigation', async ({ page }) => {
    await page.goto('/schedule');
    await page.waitForLoadState('networkidle');

    // Day selector should be navigable
    const dayButtons = await page.locator('[data-testid="day-nav"] button, [role="tab"]').all();

    if (dayButtons.length > 0) {
      for (const button of dayButtons) {
        // Each day button should have an accessible name
        const accessibleName =
          (await button.getAttribute('aria-label')) ||
          (await button.innerText());
        expect(accessibleName.trim().length).toBeGreaterThan(0);
      }
    }
  });

  test('should have accessible activity cards', async ({ page }) => {
    await page.goto('/schedule?day=1');
    await page.waitForLoadState('networkidle');

    // Activity cards should be accessible
    const cards = await page.locator('[data-testid="activity-card"], article').all();

    for (const card of cards) {
      // Cards should have semantic structure
      const hasHeading = await card.locator('h1, h2, h3, h4, h5, h6').count();
      // Either has heading or has aria-label
      const ariaLabel = await card.getAttribute('aria-label');
      expect(hasHeading > 0 || (ariaLabel && ariaLabel.length > 0)).toBe(true);
    }
  });

  test('should have proper list semantics for timeline', async ({ page }) => {
    await page.goto('/schedule?day=1');
    await page.waitForLoadState('networkidle');

    // Timeline should use list semantics
    const lists = await page.locator('ul, ol, [role="list"]').count();
    expect(lists).toBeGreaterThan(0);
  });

  test('should have sufficient color contrast in schedule', async ({
    page,
    makeAxeBuilder,
  }) => {
    await page.goto('/schedule?day=1');
    await page.waitForLoadState('networkidle');

    const results = await makeAxeBuilder()
      .withTags(['wcag2aa'])
      .analyze();

    const contrastViolations = results.violations.filter(
      (v) => v.id === 'color-contrast'
    );

    if (contrastViolations.length > 0) {
      console.log(
        'Schedule color contrast issues:',
        JSON.stringify(formatViolations(contrastViolations), null, 2)
      );
    }

    expect(contrastViolations).toEqual([]);
  });
});
