// ════════════════════════════════════════════════════════════
// Angel Eyes AI — Service Worker
// Built autonomously by Angel Eyes AI — zero human navigation
// Makes the site: offline-capable, installable, lightning-fast
// ════════════════════════════════════════════════════════════

const CACHE_NAME = 'angel-eyes-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/proof.html',
  '/blog.html',
  '/journey.html',
  '/hire.html',
  '/quickdraw.html',
  '/manifest.json',
  '/robots.txt',
  '/sitemap.xml',
  '/git-log.json',
  '/assets/favicon.ico',
  '/assets/favicon-16x16.png',
  '/assets/favicon-32x32.png',
  '/assets/apple-touch-icon.png',
  '/assets/android-chrome-192x192.png',
  '/assets/android-chrome-512x512.png',
  '/assets/angel-eyes-cyber.png',
  '/assets/angel-eyes.png',
  '/assets/angel-eyes-real.jpg',
  '/assets/revolver.png',
  '/assets/revolver-icon.png',
  '/assets/certification-stamp.png',
  '/assets/ai-agent-infographic.png'
];

// ═══════ Install: Cache the shell ═══════
self.addEventListener('install', event => {
  console.log('[SW] Angel Eyes installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching shell assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      console.log('[SW] Install complete — activating immediately');
      return self.skipWaiting();
    })
  );
});

// ═══════ Activate: Clean old caches ═══════
self.addEventListener('activate', event => {
  console.log('[SW] Angel Eyes activated');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => {
              console.log('[SW] Deleting old cache:', key);
              return caches.delete(key);
            })
      );
    }).then(() => {
      console.log('[SW] Claiming all clients');
      return self.clients.claim();
    })
  );
});

// ═══════ Fetch: Cache-first with network fallback ═══════
self.addEventListener('fetch', event => {
  // Skip non-GET requests and browser extensions
  if (event.request.method !== 'GET') return;
  
  // Skip Firebase hosting internal requests
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/__/')) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      // Return cached response immediately
      const fetchPromise = fetch(event.request).then(networkResponse => {
        // Cache new successful responses for future offline use
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Network failed — if we have a cached version, it was already returned above
        console.log('[SW] Offline — serving from cache only');
      });

      // Return cached version first, update cache in background
      return cached || fetchPromise;
    })
  );
});

// ═══════ Message: Handle skipWaiting and cache updates ═══════
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
  if (event.data === 'updateCache') {
    caches.open(CACHE_NAME).then(cache => {
      STATIC_ASSETS.forEach(url => {
        cache.add(url).catch(() => {});
      });
    });
  }
});

console.log('[SW] Angel Eyes Service Worker loaded — built autonomously');
