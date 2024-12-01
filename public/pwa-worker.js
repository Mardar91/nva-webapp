// Versione della cache e configurazione
const CACHE_VERSION = 'nva-cache-v7';
const CACHE_NAME = `${CACHE_VERSION}`;

// Risorse essenziali per l'app shell
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

// Migliore gestione delle richieste da cachare
const shouldCache = (request) => {
  // Verifica se la richiesta è GET
  if (request.method !== 'GET') return false;

  // Verifica l'URL della richiesta
  const url = new URL(request.url);

  // Non cachare specifiche richieste
  const excludePatterns = [
    'analytics',
    'OneSignal',
    '/push/onesignal/',
    'chrome-extension://'
  ];

  return !excludePatterns.some(pattern => url.href.includes(pattern));
};

// Gestione installazione migliorata
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // Pre-cache delle risorse essenziali
      caches.open(CACHE_NAME).then(cache => {
        console.log('[Service Worker] Pre-caching app shell');
        return cache.addAll(urlsToCache);
      }),
      // Forza l'attivazione immediata
      self.skipWaiting()
    ]).catch(error => {
      console.error('[Service Worker] Pre-cache failed:', error);
    })
  );
});

// Gestione attivazione migliorata
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Pulisci le vecchie cache
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('[Service Worker] Removing old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Prendi il controllo immediatamente
      self.clients.claim()
    ]).then(() => {
      console.log('[Service Worker] Activated and controlling');
    })
  );
});

// Gestione fetch migliorata
self.addEventListener('fetch', (event) => {
  // Ignora le richieste OneSignal e non-GET
  if (event.request.url.includes('/push/onesignal/') || event.request.method !== 'GET') {
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
            // Verifica risposta valida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Cache the response
            if (shouldCache(event.request)) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                })
                .catch(error => {
                  console.error('[Service Worker] Cache put failed:', error);
                });
            }

            return response;
          })
          .catch(error => {
            console.error('[Service Worker] Fetch failed:', error);
            // Gestione offline migliorata
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html').then(response => {
                return response || new Response('Offline page not found', {
                  status: 503,
                  statusText: 'Service Unavailable'
                });
              });
            }
            return new Response('Network error', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Gestione messaggi
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

