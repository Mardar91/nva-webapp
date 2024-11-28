// src/lib/serviceWorkerRegistration.ts

export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        // Prima verifica se esiste già una registrazione di OneSignal
        const existingRegistrations = await navigator.serviceWorker.getRegistrations();
        const oneSignalRegistration = existingRegistrations.find(reg => 
          reg.scope.includes('OneSignal') || reg.active?.scriptURL.includes('OneSignal')
        );

        // Se non c'è una registrazione OneSignal, procedi con la registrazione del tuo SW
        if (!oneSignalRegistration) {
          const registration = await navigator.serviceWorker.register('/serviceworker.js');

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
        }
      } catch (error) {
        console.error('Error during service worker registration:', error);
      }
    });

    // Aggiornamento quando l'app torna in primo piano
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        navigator.serviceWorker.ready.then(registration => {
          // Verifica che non sia una registrazione OneSignal
          if (!registration.active?.scriptURL.includes('OneSignal')) {
            const lastUpdate = localStorage.getItem('lastServiceWorkerUpdate');
            const now = Date.now();
            
            // Verifica se sono passate 24 ore dall'ultimo aggiornamento
            if (!lastUpdate || (now - parseInt(lastUpdate)) > 86400000) {
              registration.update();
              localStorage.setItem('lastServiceWorkerUpdate', now.toString());
            }
          }
        });
      }
    });
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        // Unregister solo il service worker non-OneSignal
        if (!registration.active?.scriptURL.includes('OneSignal')) {
          registration.unregister()
            .catch(error => {
              console.error('Error unregistering service worker:', error);
            });
        }
      });
    });
  }
}
