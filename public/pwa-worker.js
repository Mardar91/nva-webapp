// Versione della cache e configurazione
const CACHE_VERSION = 'nva-cache-v13';
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
  if (request.method !== 'GET') return false;
  const url = new URL(request.url);
  
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
      caches.open(CACHE_NAME).then(cache => {
        console.log('[Service Worker] Pre-caching app shell');
        return cache.addAll(urlsToCache);
      }),
      self.skipWaiting()
    ]).catch(error => {
      console.error('[Service Worker] Pre-cache failed:', error);
    })
  );
});

// Gestione attivazione con focus sulla modalità standalone
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
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
      self.clients.claim(),
      // Cerca di aprire una finestra client in modalità standalone se non esiste
      self.clients.matchAll({
        type: 'window'
      }).then(clients => {
        if (clients.length === 0) {
          // Se non ci sono client aperti, prova ad aprirne uno nuovo
          if (self.registration.scope) {
            self.clients.openWindow(self.registration.scope);
          }
        }
      })
    ]).then(() => {
      console.log('[Service Worker] Activated and controlling');
    })
  );
});

// Gestione fetch ottimizzata per la modalità standalone
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/push/onesignal/') || event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    // Prima proviamo a fare il fetch della risorsa online
    fetch(event.request)
      .catch(() => {
        // Se il fetch fallisce, controlliamo prima nella cache
        return caches.match(event.request)
          .then(cachedResponse => {
            // Se abbiamo una risposta nella cache, la restituiamo
            if (cachedResponse) {
              return cachedResponse;
            }

            // Se è una richiesta di navigazione e non abbiamo nulla nella cache, 
            // restituiamo la pagina offline
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html')
                .then(offlineResponse => {
                  // Se anche offline.html non è disponibile, restituiamo un messaggio di errore
                  if (!offlineResponse) {
                    return new Response('Offline page not found', {
                      status: 503,
                      statusText: 'Service Unavailable',
                      headers: new Headers({
                        'Content-Type': 'text/plain'
                      })
                    });
                  }
                  return offlineResponse;
                });
            }

            // Per altre richieste che non sono di navigazione, 
            // restituiamo una risposta di errore
            return new Response('Network error', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Gestione messaggi migliorata
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Gestione specifica per la modalità standalone
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage(CACHE_VERSION);
  }
});
