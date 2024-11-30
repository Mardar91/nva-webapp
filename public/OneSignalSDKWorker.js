// Import OneSignal SDK
importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

// Import our PWA worker and merge its functionality
importScripts("/pwa-worker.js");

// Consolidate caches
const CACHE_NAME = 'nva-cache-v4';

// Combine fetch handlers
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cache hit or network fetch
        return response || fetch(event.request);
      })
  );
});
