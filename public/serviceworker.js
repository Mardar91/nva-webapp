const CACHE_VERSION = 'nva-cache-v3';
const CACHE_NAME = `${CACHE_VERSION}`;
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Aggiungiamo un controllo per evitare conflitti con OneSignal
const isOneSignalRequest = (url) => {
  return url.includes('OneSignalSDK') || url.includes('onesignal');
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Cache opened');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && !cacheName.includes('OneSignal')) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Ignoriamo le richieste OneSignal
  if (isOneSignalRequest(event.request.url)) {
    return;
  }

  const headers = new Headers({
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  });

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (event.request.mode === 'navigate') {
        return fetch(event.request, { headers })
          .catch(() => response || caches.match('/'));
      }

      if (response) {
        return response;
      }

      return fetch(event.request)
        .then(networkResponse => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }
          
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          
          return networkResponse;
        })
        .catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
    })
  );
});
