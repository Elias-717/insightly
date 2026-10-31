import { test, expect } from '@playwright/test';

test.describe('Insightlet end-to-end flow', () => {
  test('load sample, browse tabs, open column, clean, export', async ({ page }) => {
    await page.goto('/');

    // Landing hero and privacy badge.
    await expect(page.getByRole('heading', { name: /Get the story/i })).toBeVisible();
    await expect(page.getByText(/never leaves your device/i)).toBeVisible();

    // Load the student grades sample.
    await page.getByRole('button', { name: 'Student grades' }).click();

    // Dashboard appears with the file name.
    await expect(page.getByText('student-grades.csv')).toBeVisible({ timeout: 20_000 });

    // All five+ tabs render.
    for (const tab of ['Overview', 'Columns', 'Charts', 'Whispers', 'Data']) {
      await expect(page.getByRole('tab', { name: new RegExp(tab) })).toBeVisible();
    }

    // Overview shows the quality gauge.
    await expect(page.getByText('Data quality')).toBeVisible();

    // Columns tab -> open a column detail.
    await page.getByRole('tab', { name: /Columns/ }).click();
    await page.getByLabel(/Open details for score/).click();
    await expect(page.getByText('Numeric statistics')).toBeVisible();

    // Charts tab renders at least one chart heading.
    await page.getByRole('tab', { name: /Charts/ }).click();
    await expect(page.getByText(/Distribution of|Correlation heatmap|Over time/)).toBeVisible();

    // Whispers tab shows insights.
    await page.getByRole('tab', { name: /Whispers/ }).click();
    await expect(page.getByText(/ranked by importance/)).toBeVisible();

    // Clean tab -> run a cleaning action.
    await page.getByRole('tab', { name: /Clean/ }).click();
    await page.getByRole('button', { name: 'Trim whitespace' }).click();
    await expect(page.getByText(/before . after/i)).toBeVisible();

    // Data tab renders the table with a search box.
    await page.getByRole('tab', { name: /Data/ }).click();
    await expect(page.getByLabel('Search the data table')).toBeVisible();

    // Export a Markdown report (deterministic, no canvas needed).
    await page.getByRole('tab', { name: /Whispers/ }).click();
    const downloadPromise = page.waitForEvent('download');
    // The export bar is at the top of the dashboard.
    await page.getByRole('button', { name: 'Export Markdown' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.md');
  });

  test('keyboard shortcut opens the shortcuts dialog', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('?');
    await expect(page.getByRole('dialog', { name: /Keyboard shortcuts/i })).toBeVisible();
  });
});
