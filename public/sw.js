// Service Worker for Image and Asset Caching
// This service worker implements aggressive caching strategies for performance

const CACHE_VERSION = 'v1';
const CACHE_NAME = `sailakshmi-cache-${CACHE_VERSION}`;

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
];

// Image cache name
const IMAGE_CACHE = `sailakshmi-images-${CACHE_VERSION}`;

// Cache duration (7 days for images)
const IMAGE_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return name.startsWith('sailakshmi-') && 
                   name !== CACHE_NAME && 
                   name !== IMAGE_CACHE;
          })
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Image caching strategy: Cache First, Network Fallback
  if (request.destination === 'image' || /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(url.pathname)) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        
        // Return cached image if available and fresh
        if (cached) {
          const cachedDate = new Date(cached.headers.get('date'));
          const now = new Date();
          
          if (now - cachedDate < IMAGE_CACHE_DURATION) {
            return cached;
          }
        }

        // Fetch from network
        try {
          const response = await fetch(request);
          
          // Cache successful responses
          if (response.ok) {
            cache.put(request, response.clone());
          }
          
          return response;
        } catch (error) {
          // Return cached version if network fails
          if (cached) {
            return cached;
          }
          throw error;
        }
      })
    );
    return;
  }

  // API requests: Network First, Cache Fallback
  if (url.pathname.includes('/api/') || url.pathname.includes('/orders/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request);
        })
    );
    return;
  }

  // Static assets: Cache First
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }

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

// Message event - manual cache clearing
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
