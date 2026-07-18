// Service Worker for Image and Asset Caching
// This service worker implements aggressive caching strategies for performance

// ─────────────────────────────────────────────────────────────────────────────
// IMPORTANT: Bump CACHE_VERSION every time you:
//   • Rotate Firebase or Cloudflare credentials
//   • Deploy a new production build
//   • Change any environment variable
//
// Bumping this version forces ALL browsers to:
//   1. Install the new service worker immediately (skipWaiting)
//   2. Delete every old cache (activate handler)
//   3. Re-fetch all assets from the network
//
// v1 → original
// v2 → initial release
// v3 → Firebase project migration (samskruthi-auth-b8ee6 → sai-lakshmi-home-foods)
// ─────────────────────────────────────────────────────────────────────────────
const CACHE_VERSION = 'v3';
const CACHE_NAME = `sailakshmi-cache-${CACHE_VERSION}`;

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
];

// Image cache name (images only — JS/CSS are NOT cached, they have content-hash names)
const IMAGE_CACHE = `sailakshmi-images-${CACHE_VERSION}`;

// Cache duration (7 days for images)
const IMAGE_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;

// ── Install: cache static assets and take over immediately ───────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Take over from old SW immediately — do NOT wait for tabs to close
  self.skipWaiting();
});

// ── Activate: delete ALL old caches, then claim all clients ──────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            // Delete any sailakshmi-* cache that isn't the current version
            return name.startsWith('sailakshmi-') &&
                   name !== CACHE_NAME &&
                   name !== IMAGE_CACHE;
          })
          .map((name) => {
            console.log('[SW] Deleting stale cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      // Claim all open tabs immediately so they get the new SW right away
      return self.clients.claim();
    })
  );
});

// ── Fetch: routing strategies ─────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // ── JS / CSS bundles: ALWAYS network-first, NEVER cache ──────────────────
  // Vite builds content-hashed filenames so caching them in SW is redundant
  // and causes stale-bundle problems when credentials are rotated.
  if (url.pathname.startsWith('/assets/js/') || url.pathname.startsWith('/assets/css/') || url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
    // Network only — let the browser's own HTTP cache handle these
    return;
  }

  // ── API requests: ALWAYS network-only ────────────────────────────────────
  // Product catalog, prices, and stock must always reflect the live database.
  if (url.pathname.includes('/api/')) {
    event.respondWith(fetch(request));
    return;
  }

  // ── Firebase / Google requests: ALWAYS network-only ──────────────────────
  // Never cache auth tokens, identity toolkit requests, or FCM
  if (url.hostname.includes('googleapis.com') ||
      url.hostname.includes('firebaseio.com') ||
      url.hostname.includes('firebaseapp.com') ||
      url.hostname.includes('identitytoolkit') ||
      url.hostname.includes('securetoken')) {
    event.respondWith(fetch(request));
    return;
  }

  // ── Images: Cache-First with freshness check ──────────────────────────────
  if (request.destination === 'image' || /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(url.pathname)) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(async (cache) => {
        const cached = await cache.match(request);

        if (cached) {
          const cachedDate = new Date(cached.headers.get('date'));
          const now = new Date();
          if (now - cachedDate < IMAGE_CACHE_DURATION) {
            return cached;
          }
        }

        try {
          const response = await fetch(request);
          if (response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        } catch (error) {
          if (cached) return cached;
          throw error;
        }
      })
    );
    return;
  }

  // ── Everything else: Cache-First (HTML, fonts, icons) ────────────────────
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      });
    })
  );
});

// ── Message: manual cache-clear trigger from app code ────────────────────────
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('sailakshmi-'))
            .map((name) => caches.delete(name))
        );
      })
    );
  }
});
