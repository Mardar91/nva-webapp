// src/lib/serviceWorkerRegistration.ts
export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // Prima rimuoviamo eventuali vecchi service worker
      navigator.serviceWorker
        .getRegistrations()
        .then(function(registrations) {
          for(let registration of registrations) {
            if(registration.active && 
               (registration.active.scriptURL.includes('serviceworker.js') || 
                registration.active.scriptURL.includes('pwa-worker.js'))) {
              registration.unregister();
            }
          }
        });

      // Registriamo solo il OneSignal worker che includerà anche il PWA worker
      navigator.serviceWorker
        .register('/OneSignalSDKWorker.js')
        .then(registration => {
          // Controllo automatico ogni 24 ore
          setInterval(() => {
            registration.update();
          }, 1000 * 60 * 60 * 24); // 24 ore

          // Gestione aggiornamenti
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Verifica l'ultima notifica mostrata
                  const lastUpdatePrompt = localStorage.getItem('lastUpdatePrompt');
                  const now = Date.now();
                  
                  // Se sono passate 24 ore dall'ultima notifica
                  if (!lastUpdatePrompt || (now - parseInt(lastUpdatePrompt)) > 86400000) {
                    // Salva il timestamp prima di mostrare la notifica
                    localStorage.setItem('lastUpdatePrompt', now.toString());
                    
                    // Mostra la notifica di aggiornamento
                    if (window.confirm('Nuova versione disponibile! Vuoi aggiornare?')) {
                      window.location.reload();
                    }
                  }
                }
              });
            }
          });
        })
        .catch(error => {
          console.error('Error during OneSignal worker registration:', error);
        });

      // Aggiornamento quando l'app torna in primo piano
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          navigator.serviceWorker.ready.then(registration => {
            const lastUpdate = localStorage.getItem('lastServiceWorkerUpdate');
            const now = Date.now();
            
            // Verifica se sono passate 24 ore dall'ultimo aggiornamento
            if (!lastUpdate || (now - parseInt(lastUpdate)) > 86400000) {
              registration.update();
              localStorage.setItem('lastServiceWorkerUpdate', now.toString());
            }
          });
        }
      });
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
