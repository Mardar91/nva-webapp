import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import App from "./App";
import * as serviceWorkerRegistration from './lib/serviceWorkerRegistration';

// Versioning
const APP_VERSION = '1.0.0'; // Incrementa questa versione quando rilasci aggiornamenti

// Cache management functions
const clearCache = async () => {
  if ('caches' in window) {
    const cacheKeys = await caches.keys();
    await Promise.all(
      cacheKeys.map(key => caches.delete(key))
    );
  }
};

const checkForUpdates = async () => {
  const storedVersion = localStorage.getItem('app-version');
  if (storedVersion !== APP_VERSION) {
    console.log('New version detected, clearing cache...');
    await clearCache();
    localStorage.setItem('app-version', APP_VERSION);
    return true;
  }
  return false;
};

// Service Worker update handler
const handleServiceWorkerUpdate = async (registration: ServiceWorkerRegistration) => {
  if (registration.waiting) {
    // Nuovo service worker in attesa
    await clearCache();
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
  }
};

// Utility functions for PWA detection and platform checking
const isIOS = () => {
  if (typeof window !== 'undefined') {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
  }
  return false;
};

// Helper per controllare se siamo già stati reindirizzati
const hasRedirectParam = () => {
  if (typeof window === 'undefined') return false;
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has('pwa-redirected');
};

// Funzione migliorata per il rilevamento della modalità standalone
const isInStandaloneMode = () => 
  typeof window !== 'undefined' && 
  (window.matchMedia('(display-mode: standalone)').matches || 
   window.matchMedia('(display-mode: fullscreen)').matches || 
   window.matchMedia('(display-mode: minimal-ui)').matches || 
   ('standalone' in window.navigator && (window.navigator as any).standalone));

// Funzione per verificare se l'app è effettivamente installata
const checkActualInstallation = async () => {
  if ('getInstalledRelatedApps' in navigator) {
    try {
      // @ts-ignore - L'API getInstalledRelatedApps non è ancora in TypeScript
      const relatedApps = await navigator.getInstalledRelatedApps();
      return relatedApps.length > 0;
    } catch (e) {
      console.log('GetInstalledRelatedApps check failed:', e);
      return localStorage.getItem('pwa-installed') === 'true';
    }
  }
  return localStorage.getItem('pwa-installed') === 'true';
};

// Funzione migliorata per verificare l'installazione
const isPWAInstalled = () => {
  if (typeof window === 'undefined') return false;
  if (hasRedirectParam()) return false;
  
  const isInstalledInStorage = localStorage.getItem('pwa-installed') === 'true';
  const isInPWAMode = window.matchMedia('(display-mode: standalone)').matches || 
                      window.matchMedia('(display-mode: fullscreen)').matches || 
                      window.matchMedia('(display-mode: minimal-ui)').matches;
  
  return isInstalledInStorage || isInPWAMode;
};
// PWA installation and redirection handling
if (typeof window !== 'undefined') {
  // Store original URL
  const originalUrl = window.location.href;
  
  // Funzione migliorata per il reindirizzamento
  const attemptPWARedirect = async () => {
    // Verifica aggiornamenti prima del reindirizzamento
    const hasUpdate = await checkForUpdates();
    if (hasUpdate) {
      window.location.reload();
      return;
    }
    
    // Verifica se l'app è effettivamente installata
    const isActuallyInstalled = await checkActualInstallation();
    
    if (!isInStandaloneMode() && isPWAInstalled() && isActuallyInstalled) {
      const pwaUrl = new URL(originalUrl);
      // Rimuovi eventuali parametri esistenti
      pwaUrl.search = '';
      // Aggiungi i nuovi parametri
      pwaUrl.searchParams.set('pwa-redirected', 'true');
      pwaUrl.searchParams.set('t', Date.now().toString());
      pwaUrl.searchParams.set('source', 'browser');
      
      // Forza il reindirizzamento per entrambe le piattaforme
      if (isIOS()) {
        window.location.href = pwaUrl.toString();
      } else {
        if (!hasRedirectParam()) {
          try {
            window.location.replace(pwaUrl.toString());
          } catch (e) {
            window.location.href = pwaUrl.toString();
          }
        }
      }
    }
  };

  // Gestione aggiornamenti del service worker
  const handleServiceWorkerUpdate = async (registration: ServiceWorkerRegistration) => {
    if (registration.waiting) {
      // Nuovo service worker in attesa
      await clearCache();
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  // iOS specific handlers con gestione aggiornamenti
  if (isIOS()) {
    window.addEventListener('load', async () => {
      if ((window.navigator as any).standalone) {
        localStorage.setItem('pwa-installed', 'true');
      }
      await checkForUpdates();
    });

    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState === 'visible') {
        const hasUpdate = await checkForUpdates();
        if (hasUpdate) {
          window.location.reload();
          return;
        }
        
        if ((window.navigator as any).standalone) {
          localStorage.setItem('pwa-installed', 'true');
        }
        attemptPWARedirect();
      }
    });
  }

  // Installation tracking migliorato con gestione aggiornamenti
  window.addEventListener('appinstalled', async (evt) => {
    localStorage.setItem('pwa-installed', 'true');
    localStorage.setItem('app-version', APP_VERSION);
    console.log('PWA installed successfully');
    setTimeout(async () => {
      await attemptPWARedirect();
    }, 1000);
  });

  // Gestione display mode
  window.matchMedia('(display-mode: standalone)').addEventListener('change', async (evt) => {
    if (evt.matches) {
      localStorage.setItem('pwa-installed', 'true');
      await checkForUpdates();
      await attemptPWARedirect();
    }
  });

  // Controllo iniziale e tentativo di reindirizzamento
  window.addEventListener('load', async () => {
    const hasUpdate = await checkForUpdates();
    if (hasUpdate) {
      window.location.reload();
      return;
    }
    
    const isActuallyInstalled = await checkActualInstallation();
    if (isActuallyInstalled) {
      await attemptPWARedirect();
    }
  });
  // Install banners
  let deferredPrompt: any;

  // Android/Chrome banner
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    const installBanner = document.createElement('div');
    installBanner.id = 'install-banner';
    installBanner.className = 'fixed bottom-4 left-4 right-4 bg-white p-6 rounded-xl shadow-lg flex flex-col z-50';
    
    installBanner.innerHTML = `
      <div class="flex flex-col w-full">
        <div class="text-[#1e3a8a] font-bold text-xl mb-2">
          Install Nonna Vittoria Apartments
        </div>
        <div class="text-gray-600 mb-4">
          Get faster access to bookings and special offers
        </div>
      </div>
      <div class="flex gap-3 w-full">
        <button id="skip-install" class="flex-1 px-6 py-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
          Not now
        </button>
        <button id="install-button" class="flex-1 px-6 py-2.5 rounded-lg bg-[#1e3a8a] text-white hover:bg-[#1e3a8a]/90 transition-colors">
          Install
        </button>
      </div>
    `;

    document.body.appendChild(installBanner);
    
    const installButton = document.getElementById('install-button');
    const skipButton = document.getElementById('skip-install');

    if (skipButton) {
      skipButton.addEventListener('click', () => {
        installBanner.remove();
      });
    }
    
    if (installButton) {
      installButton.addEventListener('click', async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          console.log(`User response to install prompt: ${outcome}`);
          deferredPrompt = null;
          if (outcome === 'accepted') {
            localStorage.setItem('pwa-installed', 'true');
            localStorage.setItem('app-version', APP_VERSION);
            installBanner.remove();
          }
        }
      });
    }
  });

  // iOS banner
  if (isIOS() && !isInStandaloneMode()) {
    const iosBanner = document.createElement('div');
    iosBanner.id = 'ios-install-banner';
    iosBanner.className = 'fixed bottom-4 left-4 right-4 bg-white p-6 rounded-xl shadow-lg z-50';
    
    iosBanner.innerHTML = `
      <div class="flex flex-col items-center">
        <div class="text-[#1e3a8a] font-bold text-xl mb-4 text-center">
          Install Nonna Vittoria Apartments
        </div>
        <div class="flex items-center gap-2 mb-3">
          <div class="text-gray-600">1. Tap the Share button</div>
          <svg class="w-6 h-6 text-[#1e3a8a]" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L12 15M12 2L8 5.5M12 2L16 5.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 10H5C3.89543 10 3 10.8954 3 12V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V12C21 10.8954 20.1046 10 19 10H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="text-gray-600 mb-4">2. Choose "Add to Home screen"</div>
        <button id="close-ios-banner" class="px-6 py-2.5 rounded-lg bg-[#1e3a8a] text-white hover:bg-[#1e3a8a]/90 transition-colors">
          Close
        </button>
      </div>
    `;
    
    document.body.appendChild(iosBanner);
    
    const closeButton = document.getElementById('close-ios-banner');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        iosBanner.remove();
        localStorage.setItem('banner-closed', Date.now().toString());
      });
    }
  }
}

// Service Worker registration con gestione aggiornamenti
if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
  if ('serviceWorker' in navigator) {
    // Registra il service worker e gestisci gli aggiornamenti
    navigator.serviceWorker.ready.then(registration => {
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              handleServiceWorkerUpdate(registration);
            }
          });
        }
      });
    });

    // Listener per il messaggio SKIP_WAITING
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }

  // Registra il service worker
  serviceWorkerRegistration.register();

  // Update service worker on online event
  window.addEventListener('online', async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      registration.update();
    }
  });

  // Update service worker on visibility change
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible' && 'serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      registration.update();
    }
  });
}

// App rendering
const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} else {
  console.error("Root element not found in DOM");
}
