import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility scans with axe-core on the main screens, in both light and
 * dark mode. We assert there are no serious or critical violations.
 */

async function scan(page: import('@playwright/test').Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  const serious = results.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  );
  return serious;
}

test.describe('accessibility', () => {
  // Scan the settled page. Mid-animation, fading text is partly transparent and
  // axe reports it as low contrast; reduced motion renders the final state at once.
  test.use({ reducedMotion: 'reduce' });

  test('landing page has no serious violations (light)', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Get the story/i })).toBeVisible();
    const violations = await scan(page);
    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  });

  test('landing page has no serious violations (dark)', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /dark mode/i }).click();
    const violations = await scan(page);
    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  });

  test('dashboard has no serious violations (light)', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Student grades' }).click();
    await expect(page.getByText('student-grades.csv')).toBeVisible({ timeout: 20_000 });
    const violations = await scan(page);
    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  });

  test('dashboard has no serious violations (dark)', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Student grades' }).click();
    await expect(page.getByText('student-grades.csv')).toBeVisible({ timeout: 20_000 });
    await page.getByRole('button', { name: /dark mode/i }).click();
    const violations = await scan(page);
    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  });
});
