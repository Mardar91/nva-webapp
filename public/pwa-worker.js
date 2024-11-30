const CACHE_VERSION = 'nva-cache-v4';
const CACHE_NAME = `${CACHE_VERSION}`;
const APP_SHELL_CACHE = `${CACHE_VERSION}-appshell`;

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
  // Lista di URL da non cachare
  const urlsToIgnore = [
    'analytics',
    'chrome-extension',
    'browser-extension',
    'pwa=true'
  ];

  // Non cachare se l'URL contiene uno dei pattern da ignorare
  if (urlsToIgnore.some(url => request.url.includes(url))) {
    return false;
  }

  // Cacha solo richieste GET
  return request.method === 'GET';
};

// Helper per pulire gli URL dai parametri PWA
const cleanUrl = (url) => {
  try {
    const urlObj = new URL(url);
    // Rimuovi i parametri PWA specifici
    urlObj.searchParams.delete('pwa');
    urlObj.searchParams.delete('source');
    return urlObj.toString();
  } catch (e) {
    return url;
  }
};

// Installazione
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(APP_SHELL_CACHE).then(cache => {
        console.log('App shell cache opened');
        return cache.addAll(urlsToCache);
      }),
      caches.open(CACHE_NAME)
    ]).catch(error => {
      console.error('Cache initialization failed:', error);
    })
  );
  self.skipWaiting();
});

// Attivazione e pulizia cache vecchie
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (!cacheName.includes(CACHE_VERSION)) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Prendi il controllo immediatamente
        return self.clients.claim();
      })
  );
});

// Gestione delle richieste fetch
self.addEventListener('fetch', (event) => {
  // Pulisci l'URL dai parametri PWA
  const cleanRequest = new Request(cleanUrl(event.request.url), {
    method: event.request.method,
    headers: event.request.headers,
    mode: event.request.mode,
    credentials: event.request.credentials,
    redirect: event.request.redirect
  });

  event.respondWith(
    caches.match(cleanRequest)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone della richiesta pulita
        const fetchRequest = cleanRequest.clone();

        return fetch(fetchRequest)
          .then(response => {
            // Verifica risposta valida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Cache della risposta se necessario
            if (shouldCache(cleanRequest)) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(cleanRequest, responseToCache);
                });
            }

            return response;
          })
          .catch(error => {
            console.error('Fetch failed:', error);
            // Se la richiesta fallisce durante la navigazione
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            // Per altre richieste fallite
            return new Response('Network error', {
              status: 408,
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Gestione dei messaggi
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
