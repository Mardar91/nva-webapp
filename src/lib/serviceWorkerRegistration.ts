// src/lib/serviceWorkerRegistration.ts

export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/serviceworker.js')
        .then(registration => {
          // Rimuoviamo il controllo automatico degli aggiornamenti
          // che causa il loop di notifiche
          
          // Gestisce gli aggiornamenti solo quando necessario
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                // Modifichiamo la logica per evitare loop di aggiornamenti
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Controlliamo se l'utente ha già visto la notifica recentemente
                  const lastUpdatePrompt = localStorage.getItem('lastUpdatePrompt');
                  const now = Date.now();
                  if (!lastUpdatePrompt || (now - parseInt(lastUpdatePrompt)) > 1000 * 60 * 60 * 24) {
                    if (window.confirm('Nuova versione disponibile! Vuoi aggiornare?')) {
                      localStorage.setItem('lastUpdatePrompt', now.toString());
                      window.location.reload();
                    }
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

    // Modifichiamo anche la gestione dell'aggiornamento quando l'app torna in primo piano
    let visibilityTimeout: number | null = null;
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        // Evitiamo aggiornamenti troppo frequenti
        if (visibilityTimeout) {
          clearTimeout(visibilityTimeout);
        }
        visibilityTimeout = window.setTimeout(() => {
          navigator.serviceWorker.ready.then(registration => {
            const lastUpdate = localStorage.getItem('lastServiceWorkerUpdate');
            const now = Date.now();
            if (!lastUpdate || (now - parseInt(lastUpdate)) > 1000 * 60 * 60) {
              registration.update();
              localStorage.setItem('lastServiceWorkerUpdate', now.toString());
            }
          });
        }, 1000 * 30); // Aspettiamo 30 secondi prima di controllare gli aggiornamenti
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
