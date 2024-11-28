// src/lib/serviceWorkerRegistration.ts

const ONESIGNAL_SW_PATH = '/OneSignalSDKWorker.js';
const APP_SW_PATH = '/serviceworker.js';

export function register() {
  if ('serviceWorker' in navigator) {
    const registerServiceWorker = async () => {
      try {
        // Aspetta che OneSignal sia completamente inizializzato
        await new Promise(resolve => {
          if (window.OneSignal?.initialized) {
            resolve(true);
          } else {
            window.OneSignalDeferred = window.OneSignalDeferred || [];
            window.OneSignalDeferred.push(function() {
              resolve(true);
            });
          }
        });

        // Registra il service worker dell'app
        const registration = await navigator.serviceWorker.register(APP_SW_PATH);
        
        // Imposta l'intervallo di aggiornamento
        const UPDATE_INTERVAL = 24 * 60 * 60 * 1000; // 24 ore
        setInterval(() => registration.update(), UPDATE_INTERVAL);

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              const now = Date.now();
              const lastUpdatePrompt = localStorage.getItem('lastUpdatePrompt');
              
              if (!lastUpdatePrompt || (now - parseInt(lastUpdatePrompt)) > UPDATE_INTERVAL) {
                localStorage.setItem('lastUpdatePrompt', now.toString());
                
                if (window.confirm('Nuova versione disponibile! Vuoi aggiornare?')) {
                  window.location.reload();
                }
              }
            }
          });
        });

        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        throw error;
      }
    };

    // Registra all'avvio
    window.addEventListener('load', registerServiceWorker);

    // Gestisci gli aggiornamenti quando l'app torna in primo piano
    let visibilityTimeout: NodeJS.Timeout;
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        // Cancella eventuali timeout pendenti
        if (visibilityTimeout) clearTimeout(visibilityTimeout);
        
        // Aggiungi un piccolo delay per evitare conflitti con OneSignal
        visibilityTimeout = setTimeout(() => {
          const lastUpdate = localStorage.getItem('lastServiceWorkerUpdate');
          const now = Date.now();
          
          if (!lastUpdate || (now - parseInt(lastUpdate)) > 24 * 60 * 60 * 1000) {
            navigator.serviceWorker.ready
              .then(registration => {
                if (!registration.active?.scriptURL.includes('OneSignal')) {
                  registration.update();
                  localStorage.setItem('lastServiceWorkerUpdate', now.toString());
                }
              })
              .catch(console.error);
          }
        }, 1000); // 1 secondo di delay
      }
    });
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations()
      .then(registrations => {
        registrations.forEach(registration => {
          if (!registration.active?.scriptURL.includes('OneSignal')) {
            registration.unregister()
              .catch(error => {
                console.error('Error unregistering service worker:', error);
              });
          }
        });
      })
      .catch(error => {
        console.error('Error getting service worker registrations:', error);
      });
  }
}
