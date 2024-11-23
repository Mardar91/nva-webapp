const CACHE_VERSION = 'nva-cache-v2'; // Incrementa questa versione ad ogni deploy importante
const CACHE_NAME = `${CACHE_VERSION}`;
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Installazione
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Cache opened');
      return cache.addAll(urlsToCache);
    })
  );
  // Forza l'attivazione immediata
  self.skipWaiting();
});

// Attivazione e pulizia delle vecchie cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Prende il controllo di tutte le schede
  return self.clients.claim();
});

// Gestione delle richieste
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Se abbiamo una risposta dalla cache, usiamola
      if (response) {
        // Ma facciamo comunque una richiesta di rete in background
        fetch(event.request).then(networkResponse => {
          if (networkResponse) {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, networkResponse.clone());
            });
          }
        });
        return response;
      }

      // Altrimenti facciamo una richiesta di rete
      return fetch(event.request)
        .then(response => {
          // Non cachare se non è una risposta valida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Se la richiesta di rete fallisce, ritorniamo una pagina di fallback
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
    })
  );
});
