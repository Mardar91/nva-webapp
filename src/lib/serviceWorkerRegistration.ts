// src/lib/serviceWorkerRegistration.ts

export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/serviceworker.js')
        .then(registration => {
          // Controlla aggiornamenti ogni 60 minuti
          setInterval(() => {
            registration.update();
          }, 1000 * 60 * 60);

          // Gestisce gli aggiornamenti
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Nuovo service worker disponibile
                  if (window.confirm('Nuova versione disponibile! Vuoi aggiornare?')) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch(error => {
          console.error('Error during service worker registration:', error);
        });
    });

    // Aggiorna quando l'app torna in primo piano
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
