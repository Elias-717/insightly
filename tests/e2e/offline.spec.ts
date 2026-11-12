import { test, expect } from '@playwright/test';

test.describe('Offline support', () => {
  test('loads and analyzes a dataset with no network after the first visit', async ({
    page,
    context,
  }) => {
    await page.goto('/');
    await page.waitForFunction(async () => {
      await navigator.serviceWorker.ready;
      return navigator.serviceWorker.controller !== null;
    });

    await context.setOffline(true);

    // Prove the network is really gone: an uncached URL must fail.
    const probe = await page.evaluate(() =>
      fetch(`/not-cached-${Date.now()}`).then(
        () => 'reached network',
        () => 'failed',
      ),
    );
    expect(probe).toBe('failed');

    await page.reload();
    await expect(page.getByRole('heading', { name: /Get the story/i })).toBeVisible();

    // Parsing uses a worker chunk that was never loaded online, so this also
    // checks that the whole build was precached.
    await page.getByRole('button', { name: 'Student grades' }).click();
    await expect(page.getByText('student-grades.csv')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole('heading', { name: 'Data quality' })).toBeVisible();

    await context.setOffline(false);
  });
});
