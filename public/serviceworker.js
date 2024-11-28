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
      request.url.includes('analytics') ||
      request.url.includes('push') ||
      request.url.includes('notification')) {
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
    Promise.all([
      // Pulisci le vecchie cache
      caches.keys()
        .then(cacheNames => {
          return Promise.all(
            cacheNames.map(cacheName => {
              if (cacheName !== CACHE_NAME && !cacheName.includes('OneSignal')) {
                return caches.delete(cacheName);
              }
            })
          );
        }),
      // Prendi il controllo immediatamente
      self.clients.claim(),
      // Notifica tutti i client che il service worker è stato attivato
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_ACTIVATED',
            version: CACHE_VERSION
          });
        });
      })
    ])
  );
});

// Fetch
self.addEventListener('fetch', (event) => {
  // Non intercettare richieste OneSignal
  if (event.request.url.includes('OneSignal') || 
      event.request.url.includes('onesignal') ||
      event.request.url.includes('push') ||
      event.request.url.includes('notification')) {
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

// Gestione messaggi
self.addEventListener('message', (event) => {
  // Gestione messaggi da OneSignal
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Gestione messaggi per l'aggiornamento della cache
  if (event.data && event.data.type === 'CACHE_UPDATE') {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(cache => {
          return cache.addAll(urlsToCache);
        })
    );
  }

  // Rispondi a tutti i messaggi per confermare la ricezione
  if (event.source) {
    event.source.postMessage({
      type: 'SW_MESSAGE_RECEIVED',
      originalMessage: event.data
    });
  }
});

// Gestione push notifications (per compatibilità con OneSignal)
self.addEventListener('push', (event) => {
  // Lascia che OneSignal gestisca le notifiche push
  if (event.data && !event.data.text().includes('OneSignal')) {
    console.log('Push event non-OneSignal:', event);
  }
});

// Gestione click sulle notifiche
self.addEventListener('notificationclick', (event) => {
  // Lascia che OneSignal gestisca i click sulle notifiche
  if (event.notification.tag && !event.notification.tag.includes('OneSignal')) {
    console.log('Notification click non-OneSignal:', event);
  }
});

// Gestione errori
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event.error);
});

// Gestione errori non gestiti
self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker unhandled rejection:', event.reason);
});
