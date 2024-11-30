// src/lib/serviceWorkerRegistration.ts
export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // Prima rimuoviamo eventuali vecchi service worker
      navigator.serviceWorker
        .getRegistrations()
        .then(function(registrations) {
          for(let registration of registrations) {
            if(registration.active && registration.active.scriptURL.includes('serviceworker.js')) {
              registration.unregister();
            }
          }
        });

      // Registriamo il PWA worker
      navigator.serviceWorker
        .register('/pwa-worker.js')
        .catch(error => {
          console.error('Error during service worker registration:', error);
        });
    });

    // Aggiornamento quando l'app torna in primo piano
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        navigator.serviceWorker.ready.then(registration => {
          registration.update();
        });
      }
    });
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => {
        registration.unregister();
      })
      .catch(error => {
        console.error(error.message);
      });
  }
}
