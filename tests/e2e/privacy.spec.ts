import { test, expect, type Request } from '@playwright/test';

/**
 * The privacy guarantee as a test: load a file with a unique marker, use every
 * tab and every export, and prove no request left the origin, none was a write,
 * none carried the data, and the CSP never had to block anything.
 */
const CANARY = 'canary-7f3a9c';
const CSV = [
  'customer_id,city,spend,signup',
  `1,${CANARY},120.5,2024-01-03`,
  '2,Lyon,98.1,2024-02-11',
  '3,Paris,240.0,2024-03-09',
  '4,Nice,15.2,2024-04-22',
  '5,Paris,77.7,2024-05-30',
].join('\n');

test('a loaded file is never sent anywhere', async ({ page, context, baseURL }) => {
  const origin = new URL(baseURL!).origin;
  const requests: Request[] = [];
  context.on('request', (request) => requests.push(request));

  await page.addInitScript(() => {
    const store = window as unknown as { __cspViolations: string[] };
    store.__cspViolations = [];
    document.addEventListener('securitypolicyviolation', (e) => {
      store.__cspViolations.push(`${e.violatedDirective} ${e.blockedURI}`);
    });
  });

  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const afterLoad = requests.length;

  await page.getByLabel('Choose a CSV or TSV file').setInputFiles({
    name: 'private.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(CSV),
  });
  await expect(page.getByText('private.csv')).toBeVisible({ timeout: 20_000 });

  for (const tab of ['Overview', 'Columns', 'Charts', 'Whispers', 'Clean', 'Data']) {
    await page.getByRole('tab', { name: new RegExp(tab) }).click();
  }

  for (const format of ['HTML', 'Markdown', 'Cleaned CSV', 'PDF']) {
    await page.getByRole('button', { name: 'Export' }).click();
    const download = page.waitForEvent('download', { timeout: 30_000 });
    await page.getByRole('menuitem', { name: format }).click();
    await download;
  }

  await page.getByRole('button', { name: 'New file' }).click();
  await expect(page.getByText(/data was cleared/i)).toBeVisible();
  await page.waitForLoadState('networkidle');

  for (const request of requests) {
    const url = new URL(request.url());
    if (url.protocol === 'blob:' || url.protocol === 'data:') continue;
    expect(url.origin, request.url()).toBe(origin);
    expect(request.method(), request.url()).toBe('GET');
    expect(request.url()).not.toContain(CANARY);
    expect(request.postData()).toBeNull();
  }

  // After the page loaded, only the app's own static files may be fetched
  // (lazily loaded chunks for charts, the worker, and PDF export).
  for (const request of requests.slice(afterLoad)) {
    const { pathname, search } = new URL(request.url());
    if (request.url().startsWith('blob:') || request.url().startsWith('data:')) continue;
    expect(pathname, request.url()).toMatch(/^\/(_next\/static\/|favicon\.svg$|sw\.js$)/);
    expect(search, request.url()).toBe('');
  }

  const violations = await page.evaluate(
    () => (window as unknown as { __cspViolations: string[] }).__cspViolations,
  );
  expect(violations).toEqual([]);
});
