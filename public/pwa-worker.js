const CACHE_VERSION = 'nva-cache-v5';
const CACHE_NAME = `${CACHE_VERSION}`;

// Risorse essenziali da cachare per l'app shell
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-180x180.png',
  '/icons/icon-167x167.png',
  '/icons/icon-152x152.png',
  '/offline.html',
  '/sounds/click.wav'
];

// Helper per verificare se una richiesta dovrebbe essere cachata
const shouldCache = (request) => {
  // Non cachare richieste analytics e OneSignal
  if (request.url.includes('analytics') || 
      request.url.includes('OneSignal') || 
      request.url.includes('/push/onesignal/')) {
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
            if (cacheName !== CACHE_NAME) {
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
  // Ignora le richieste OneSignal
  if (event.request.url.includes('/push/onesignal/')) {
    return;
  }

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

