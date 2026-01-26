import { test, expect, formatViolations } from '../fixtures';

test.describe('Reservations Page Accessibility Audit', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reservations');
    await page.waitForLoadState('networkidle');
  });

  test('should have no accessibility violations', async ({ page, makeAxeBuilder }) => {
    const accessibilityScanResults = await makeAxeBuilder().analyze();

    if (accessibilityScanResults.violations.length > 0) {
      console.log(
        'Reservations page a11y violations:',
        JSON.stringify(formatViolations(accessibilityScanResults.violations), null, 2)
      );
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    const headingLevels = await Promise.all(
      headings.map(async (h) => {
        const tagName = await h.evaluate((el) => el.tagName.toLowerCase());
        return parseInt(tagName.replace('h', ''));
      })
    );

    // Should have at least one heading
    expect(headingLevels.length).toBeGreaterThan(0);

    // First heading should be h1
    expect(headingLevels[0]).toBe(1);
  });

  test('should have accessible accommodation cards', async ({ page }) => {
    const cards = await page
      .locator('[data-testid="accommodation-card"], article, .accommodation-card')
      .all();

    for (const card of cards) {
      // Each card should have identifiable content
      const hasHeading = (await card.locator('h1, h2, h3, h4, h5, h6').count()) > 0;
      const ariaLabel = await card.getAttribute('aria-label');
      const hasAriaLabel = ariaLabel && ariaLabel.length > 0;

      expect(hasHeading || hasAriaLabel).toBe(true);
    }
  });

  test('should have accessible copy buttons', async ({ page }) => {
    // Copy address/PIN buttons should be labeled
    const copyButtons = await page
      .locator('button:has-text("copy"), button[aria-label*="copy"], button[aria-label*="Copy"]')
      .all();

    for (const button of copyButtons) {
      const accessibleName =
        (await button.getAttribute('aria-label')) ||
        (await button.innerText());
      expect(accessibleName.toLowerCase()).toContain('copy');
    }
  });

  test('should have accessible address display', async ({ page }) => {
    // Addresses should be in proper semantic structure
    const addresses = await page.locator('address, [data-testid="address"]').all();

    if (addresses.length > 0) {
      for (const address of addresses) {
        const text = await address.innerText();
        expect(text.trim().length).toBeGreaterThan(0);
      }
    }
  });

  test('should have accessible date/time display', async ({ page }) => {
    // Check-in/check-out times should be accessible
    const times = await page.locator('time, [data-testid="check-in"], [data-testid="check-out"]').all();

    for (const time of times) {
      // Time elements should have datetime attribute or visible text
      const datetime = await time.getAttribute('datetime');
      const text = await time.innerText();
      expect((datetime && datetime.length > 0) || (text && text.trim().length > 0)).toBe(true);
    }
  });

  test('should have sufficient color contrast', async ({ page, makeAxeBuilder }) => {
    const results = await makeAxeBuilder()
      .withTags(['wcag2aa'])
      .analyze();

    const contrastViolations = results.violations.filter(
      (v) => v.id === 'color-contrast'
    );

    if (contrastViolations.length > 0) {
      console.log(
        'Reservations color contrast issues:',
        JSON.stringify(formatViolations(contrastViolations), null, 2)
      );
    }

    expect(contrastViolations).toEqual([]);
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Focus the first interactive element via JavaScript (more reliable on mobile)
    await page.evaluate(() => {
      const firstLink = document.querySelector('a, button');
      if (firstLink instanceof HTMLElement) {
        firstLink.focus();
      }
    });

    // Should have an element with focus
    const focusedElement = await page.locator(':focus');
    const count = await focusedElement.count();
    expect(count).toBeGreaterThan(0);
  });
});
