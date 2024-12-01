export function register() {
  if ('serviceWorker' in navigator) {
    // Attendi che la finestra sia completamente caricata
    window.addEventListener('load', () => {
      const swUrl = '/pwa-worker.js';

      // Registra il PWA worker con scope esplicito
      navigator.serviceWorker
        .register(swUrl, {
          scope: '/',
          updateViaCache: 'none' // Forza il controllo degli aggiornamenti
        })
        .then(registration => {
          // Controllo immediato per aggiornamenti
          registration.update();

          // Controllo periodico ogni ora invece che 24 ore per maggiore reattività
          setInterval(() => {
            registration.update();
          }, 1000 * 60 * 60);

          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    // Nuovo service worker disponibile
                    const lastUpdatePrompt = localStorage.getItem('lastUpdatePrompt');
                    const now = Date.now();
                    
                    // Ridotto a 1 ora il tempo tra le notifiche
                    if (!lastUpdatePrompt || (now - parseInt(lastUpdatePrompt)) > 3600000) {
                      localStorage.setItem('lastUpdatePrompt', now.toString());
                      
                      if (window.confirm('Nuova versione disponibile! Vuoi aggiornare?')) {
                        newWorker.postMessage({ type: 'SKIP_WAITING' });
                        window.location.reload();
                      }
                    }
                  }
                }
              });
            }
          });
        })
        .catch(error => {
          console.error('Service worker registration failed:', error);
        });

      // Registrazione OneSignal
      navigator.serviceWorker
        .register('/push/onesignal/OneSignalSDKWorker.js', {
          scope: '/push/onesignal/'
        })
        .catch(error => {
          console.error('OneSignal SW registration failed:', error);
        });
    });

    // Aggiornamento più frequente quando l'app torna in primo piano
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
        console.error('Service worker unregistration failed:', error);
      });
  }
}
