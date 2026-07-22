const CACHE_NAME = 'afghan-bandi-cache-v1';
const OFFLINE_URL = '/';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/index.css',
];

// Install Event: Pre-cache basic shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching app shell');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Handle network requests and fallback offline
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Skip non-GET requests entirely
  if (event.request.method !== 'GET') {
    return;
  }

  // 1. API Endpoints: Network-First falling back to Cache
  if (requestUrl.pathname.startsWith('/api/')) {
    // Skip media stream redirect so browser handles native range requests
    if (requestUrl.pathname.includes('/stream')) {
      return;
    }

    event.respondWith(
      (async () => {
        try {
          // If cross-origin request (e.g. localhost to cloud backend), create new clean request
          const fetchReq = requestUrl.origin !== self.location.origin
            ? new Request(event.request.url, { mode: 'cors' })
            : event.request;

          const networkResponse = await fetch(fetchReq);
          if (networkResponse.ok) {
            const ct = networkResponse.headers.get('content-type') || '';
            if (ct.includes('application/json')) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseClone);
              });
            }
            return networkResponse;
          }
          
          const cached = await caches.match(event.request);
          if (cached) {
            const ct = cached.headers.get('content-type') || '';
            if (ct.includes('application/json')) {
              return cached;
            }
          }
          
          return networkResponse;
        } catch (err) {
          console.log('[Service Worker] API Fetch failed, trying cache:', requestUrl.pathname, err);
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            const ct = cachedResponse.headers.get('content-type') || '';
            if (ct.includes('application/json')) {
              return cachedResponse;
            }
          }
          // If API not in cache, return an offline JSON state
          return new Response(JSON.stringify({
            error: 'انټرنیټ پیوستون نشته',
            isOffline: true,
            message: 'تاسو دا مهال په افلاین حالت کې یاست. د خوښو شویو او تاریخچې پاڼې پرانیزئ.'
          }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
      })()
    );
    return;
  }

  // 2. Static Assets & App Shell: Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          // Cache successful responses for local assets, google fonts, and unsplash images
          if (networkResponse.status === 200) {
            const isLocal = requestUrl.origin === self.location.origin;
            const isUnsplash = requestUrl.hostname.includes('unsplash.com');
            const isGoogleFont = requestUrl.hostname.includes('fonts.googleapis.com') || requestUrl.hostname.includes('fonts.gstatic.com');
            const isMedia = requestUrl.pathname.match(/\.(mp3|ogg|wav|m4a|aac)$/i);

            if ((isLocal || isUnsplash || isGoogleFont) && !isMedia) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
          }
          return networkResponse;
        })
        .catch((err) => {
          console.log('[Service Worker] Fetch failed for:', requestUrl.pathname, err);
        });

      // Return cached response instantly if found, else wait for network fetch
      return cachedResponse || fetchPromise;
    })
  );
});
