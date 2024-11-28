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
      // Forza la ri-registrazione di OneSignal se necessario
      self.registration.pushManager.getSubscription().then(function(subscription) {
        if (subscription) {
          return subscription.unsubscribe().then(function() {
            // Notifica i client di aggiornare la registrazione
            return self.clients.matchAll().then(function(clients) {
              clients.forEach(function(client) {
                client.postMessage({
                  type: 'SUBSCRIPTION_EXPIRED',
                  timestamp: new Date().getTime()
                });
              });
            });
          });
        }
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
// Gestione push notifications
self.addEventListener('push', function(event) {
  // Log dell'evento per debug
  console.log('Push received:', event);

  try {
    // Verifica se l'evento ha dei dati
    if (event.data) {
      let data;
      try {
        // Tenta di parsare i dati come JSON
        data = event.data.json();
      } catch (e) {
        // Se non è JSON, prova a ottenere il testo
        data = event.data.text();
      }

      // Log dei dati ricevuti
      console.log('Push data:', data);

      // Se è una notifica OneSignal, lascia che OneSignal la gestisca
      if (data && typeof data === 'object' && data.custom && data.custom.i) {
        console.log('OneSignal push event detected');
        return;
      }
    }

    // Gestione dell'evento push
    event.waitUntil(
      Promise.all([
        // Notifica tutti i client
        self.clients.matchAll().then(function(clientList) {
          clientList.forEach(function(client) {
            client.postMessage({
              type: 'PUSH_RECEIVED',
              timestamp: new Date().getTime(),
              data: event.data ? event.data.text() : null
            });
          });
        }),

        // Aggiorna la sottoscrizione push
        self.registration.pushManager.getSubscription().then(function(subscription) {
          if (subscription) {
            return subscription.update();
          }
        })
      ])
    );
  } catch (err) {
    console.error('Push event handling error:', err);
  }
});

// Sistema di messaggistica migliorato
let messagePort = null;

// Gestione messaggi
self.addEventListener('message', function(event) {
  console.log('SW Message received:', event.data);

  // Gestione del canale di comunicazione
  if (event.data && event.data.type === 'INIT_PORT') {
    messagePort = event.ports[0];
    if (messagePort) {
      messagePort.postMessage({
        type: 'PORT_READY',
        timestamp: new Date().getTime()
      });
    }
  }

  // Gestione altri tipi di messaggi
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Rispondi sempre al mittente
  if (event.source) {
    event.source.postMessage({
      type: 'MESSAGE_RECEIVED',
      originalMessage: event.data,
      timestamp: new Date().getTime()
    });
  }
});
// Gestione click sulle notifiche
self.addEventListener('notificationclick', function(event) {
  console.log('Notification click:', event);

  // Chiudi la notifica
  event.notification.close();

  // Gestione del click
  event.waitUntil(
    self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(function(clientList) {
      // Cerca una finestra dell'app già aperta
      for (let client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      // Se non trova una finestra aperta, ne apre una nuova
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    }).catch(function(err) {
      console.error('Error handling notification click:', err);
    })
  );
});

// Sistema keep-alive
const KEEP_ALIVE_INTERVAL = 1000 * 60; // 1 minuto
let keepAliveInterval;

function startKeepAlive() {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
  }

  keepAliveInterval = setInterval(() => {
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'KEEP_ALIVE',
          timestamp: new Date().getTime()
        });
      });
    }).catch(err => {
      console.error('Keep-alive error:', err);
    });
  }, KEEP_ALIVE_INTERVAL);
}

startKeepAlive();

// Gestione errori generale
self.addEventListener('error', function(event) {
  console.error('Service Worker error:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
});

// Gestione promise non gestite
self.addEventListener('unhandledrejection', function(event) {
  console.error('Unhandled rejection in Service Worker:', event.reason);
});

// Utility function per controllare lo stato della rete
function isOnline() {
  return self.navigator.onLine;
}

// Gestione stato della rete
self.addEventListener('online', function() {
  console.log('Service Worker: Online');
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'ONLINE',
        timestamp: new Date().getTime()
      });
    });
  });
});

self.addEventListener('offline', function() {
  console.log('Service Worker: Offline');
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'OFFLINE',
        timestamp: new Date().getTime()
      });
    });
  });
});

// Funzione di cleanup
function cleanup() {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
  }
}

// Gestione terminazione
self.addEventListener('terminate', function() {
  cleanup();
});

// Esporta la versione del service worker per debug
self.serviceWorkerVersion = CACHE_VERSION;



