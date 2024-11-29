const CACHE_VERSION = 'nva-cache-v3';
const CACHE_NAME = `${CACHE_VERSION}`;

// Risorse essenziali da cachare
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline.html'
];

// Helper per verificare se una richiesta dovrebbe essere cachata
const shouldCache = (request) => {
  // Non cachare richieste OneSignal o analytics
  if (request.url.includes('OneSignal') || 
      request.url.includes('onesignal') ||
      request.url.includes('analytics')) {
    return false;
  }
  return request.method === 'GET';
};

// Installazione
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Cache initialization failed:', error);
      })
  );
  self.skipWaiting();
});

// Attivazione
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && !cacheName.includes('OneSignal')) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch
self.addEventListener('fetch', (event) => {
  // Se è una richiesta OneSignal, non intercettarla e lasciarla passare
  if (event.request.url.includes('OneSignal') || 
      event.request.url.includes('onesignal')) {
    return;
  }

  // Per tutte le altre richieste, applica la logica di caching
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then(response => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            if (shouldCache(event.request)) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }

            return response;
          })
          .catch(() => {
            // Se la richiesta fallisce e stiamo richiedendo una pagina
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
          });
      })
  );
});

// Gestione messaggi da OneSignal
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'ONESIGNAL_SDK_MESSAGE') {
    return; // Lascia che OneSignal gestisca i suoi messaggi
  }
});

// Gestione notifiche push
self.addEventListener('push', (event) => {
  if (event.data && event.data.text().includes('OneSignal')) {
    return; // Lascia che OneSignal gestisca le sue notifiche push
  }
});
