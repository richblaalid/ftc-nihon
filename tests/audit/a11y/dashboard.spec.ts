import { test, expect, formatViolations } from '../fixtures';

test.describe('Dashboard Accessibility Audit', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the page to fully load
    await page.waitForLoadState('networkidle');
  });

  test('should have no accessibility violations', async ({ page, makeAxeBuilder }) => {
    const accessibilityScanResults = await makeAxeBuilder().analyze();

    // Log violations for audit documentation
    if (accessibilityScanResults.violations.length > 0) {
      console.log(
        'Dashboard a11y violations:',
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

    // Check for proper hierarchy (no skipping levels)
    let previousLevel = 0;
    for (const level of headingLevels) {
      // Level should not skip more than 1 (e.g., h1 -> h3 is wrong)
      if (previousLevel > 0) {
        expect(level - previousLevel).toBeLessThanOrEqual(1);
      }
      previousLevel = level;
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
        'Color contrast issues:',
        JSON.stringify(formatViolations(contrastViolations), null, 2)
      );
    }

    expect(contrastViolations).toEqual([]);
  });

  test('should have accessible interactive elements', async ({ page }) => {
    // All buttons should have accessible names
    const buttons = await page.locator('button').all();
    for (const button of buttons) {
      const accessibleName = await button.getAttribute('aria-label') ||
        await button.innerText();
      expect(accessibleName.trim().length).toBeGreaterThan(0);
    }

    // All links should have accessible names
    const links = await page.locator('a').all();
    for (const link of links) {
      const accessibleName = await link.getAttribute('aria-label') ||
        await link.innerText();
      expect(accessibleName.trim().length).toBeGreaterThan(0);
    }
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

    // The focused element should have focus-visible styles defined in CSS
    // (We verify the CSS exists, actual visual rendering is browser-dependent)
    const hasFocusVisibleStyles = await page.evaluate(() => {
      const styles = document.styleSheets;
      for (const sheet of styles) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.cssText && rule.cssText.includes(':focus-visible')) {
              return true;
            }
          }
        } catch {
          // Cross-origin stylesheets may throw
        }
      }
      return false;
    });
    expect(hasFocusVisibleStyles).toBe(true);
  });
});
