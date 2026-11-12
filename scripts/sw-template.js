/*
 * Insightly service worker: makes the app load and run with no network.
 *
 * This is a template. `scripts/build-sw.mjs` runs after `next build`, fills in
 * the cache version and the list of files, and writes `out/sw.js`. Don't edit
 * `out/sw.js` by hand.
 *
 * It only caches the app's own static files. User data never passes through
 * here: CSVs are read from disk by the page and parsed in a Web Worker.
 *
 * Strategy:
 * - install: cache every file of this build, so lazily loaded chunks (the CSV
 *   worker, PDF export) work offline even if they were never used online.
 * - page loads: network first, so online users get new deploys; fall back to
 *   the cached page when offline or the network is too slow.
 * - everything else: cache first (build files are content-hashed), then network.
 * - activate: delete caches from older builds.
 */

const VERSION = '__VERSION__';
const CACHE = `insightly-${VERSION}`;
const PRECACHE = __PRECACHE__;
const APP_SHELL = '/';
const NAVIGATION_TIMEOUT_MS = 4000;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('insightly-') && key !== CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, url));
  } else {
    event.respondWith(cacheFirst(request));
  }
});

async function networkFirst(request, url) {
  const cache = await caches.open(CACHE);
  try {
    const response = await withTimeout(fetch(request), NAVIGATION_TIMEOUT_MS);
    if (response.ok && url.pathname === APP_SHELL) {
      await cache.put(APP_SHELL, response.clone());
    }
    return response;
  } catch {
    const cached =
      (await cache.match(request, { ignoreSearch: true })) ?? (await cache.match(APP_SHELL));
    return cached ?? Response.error();
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok && response.type === 'basic') {
    const cache = await caches.open(CACHE);
    await cache.put(request, response.clone());
  }
  return response;
}

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}
