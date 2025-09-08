// ---- Cambridge Exam Timer PWA SW (GitHub Pages) ----
const BASE = '/LVExamtimer/';                 // repo base path on GitHub Pages
const VERSION = 'v1.0.0';
const STATIC_CACHE = `exam-timer-static-${VERSION}`;
const RUNTIME_CACHE = `exam-timer-runtime-${VERSION}`;

const STATIC_ASSETS = [
  BASE,
  BASE + 'index.html',
  BASE + 'manifest.webmanifest',
  BASE + 'icon-192.png',
  BASE + 'icon-512.png'
  // If you have crucial sounds/images, add them here, e.g.:
  // BASE + 'sounds/bell.mp3',
];

// Install: cache the app shell
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

// Activate: clean old caches + claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Enable navigation preload when available
    if ('navigationPreload' in self.registration) {
      await self.registration.navigationPreload.enable();
    }
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((k) => ![STATIC_CACHE, RUNTIME_CACHE].includes(k))
        .map((k) => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

// Fetch strategy:
// 1) Navigations -> network-first, fallback to cached index.html
// 2) Static assets under BASE -> cache-first
// 3) Everything else -> stale-while-revalidate (runtime cache)
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  const isSameOrigin = url.origin === self.location.origin;

  // 1) Navigations (SPA)
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        // Use preload response if available
        const preload = await event.preloadResponse;
        if (preload) return preload;

        // Network first
        const net = await fetch(req);
        return net;
      } catch {
        // Fallback to cached shell
        const cache = await caches.open(STATIC_CACHE);
        return (await cache.match(BASE + 'index.html')) || Response.error();
      }
    })());
    return;
  }

  // 2) Static assets served from this repo path
  if (isSameOrigin && url.pathname.startsWith(BASE)) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // 3) Other requests (e.g., API/CDN) -> stale-while-revalidate
  event.respondWith(staleWhileRevalidate(req));
});

async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  const resp = await fetch(request);
  // Only cache OK responses
  if (resp && resp.status === 200 && resp.type !== 'opaque') {
    cache.put(request, resp.clone());
  }
  return resp;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then((resp) => {
    if (resp && resp.status === 200 && resp.type !== 'opaque') {
      cache.put(request, resp.clone());
    }
    return resp;
  }).catch(() => cached || Response.error());
  return cached || fetchPromise;
}

// Allow manual updates from the page (optional)
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
