import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import App from "./App";
import * as serviceWorkerRegistration from './lib/serviceWorkerRegistration';

// Versioning
const APP_VERSION = '1.2.5';

// Definizione del tipo BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Dichiarazione della variabile deferredPrompt
let deferredPrompt: BeforeInstallPromptEvent | null = null;

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
    await clearCache();
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
  }
};

// Utility functions
const isIOS = () => {
  if (typeof window !== 'undefined') {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
  }
  return false;
};

const hasRedirectParam = () => {
  if (typeof window === 'undefined') return false;
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has('pwa-redirect') && 
         (Date.now() - Number(urlParams.get('t') || 0)) < 5000;
};

const isInStandaloneMode = () => 
  typeof window !== 'undefined' && 
  (window.matchMedia('(display-mode: standalone)').matches || 
   window.matchMedia('(display-mode: fullscreen)').matches || 
   window.matchMedia('(display-mode: minimal-ui)').matches || 
   (isIOS() && (window.navigator as any).standalone));

const checkActualInstallation = async () => {
  if (isInStandaloneMode()) {
    return true;
  }

  if ('getInstalledRelatedApps' in navigator) {
    try {
      // @ts-ignore
      const relatedApps = await navigator.getInstalledRelatedApps();
      if (relatedApps.length > 0) {
        return true;
      }
    } catch (e) {
      console.log('GetInstalledRelatedApps check failed:', e);
    }
  }

  return localStorage.getItem('pwa-installed') === 'true';
};

const isPWAInstalled = async () => {
  if (typeof window === 'undefined') return false;
  if (hasRedirectParam()) return false;
  
  return await checkActualInstallation();
};

// Funzione per creare l'overlay scuro
const createDarkOverlay = () => {
  const overlay = document.createElement('div');
  overlay.id = 'install-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  overlay.style.zIndex = '9998';
  overlay.style.opacity = '0';
  overlay.style.transition = 'opacity 0.3s ease-in-out';
  
  document.body.appendChild(overlay);
  
  // Forza il reflow per attivare la transizione
  setTimeout(() => {
    overlay.style.opacity = '1';
  }, 10);
  
  return overlay;
};

// PWA installation and redirection handling
if (typeof window !== 'undefined') {
  const originalUrl = window.location.href;
  
  const attemptPWARedirect = async () => {
    if (isInStandaloneMode()) {
      return;
    }

    const isInstalled = await isPWAInstalled();
    if (!isInstalled) {
      return;
    }

    const pwaUrl = new URL(originalUrl);
    pwaUrl.search = '';
    pwaUrl.searchParams.set('pwa-redirect', 'true');
    pwaUrl.searchParams.set('t', Date.now().toString());

    if (isIOS()) {
      setTimeout(() => {
        window.location.href = pwaUrl.toString();
      }, 1500);
    } else {
      if (!hasRedirectParam()) {
        try {
          window.location.replace(pwaUrl.toString());
        } catch (e) {
          window.location.href = pwaUrl.toString();
        }
      }
    }
  };

  // Event listeners con gestione overlay
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    
    // Crea l'overlay scuro
    const overlay = createDarkOverlay();
    
    const installBanner = document.createElement('div');
    installBanner.id = 'install-banner';
    installBanner.className = 'fixed bottom-4 left-4 right-4 bg-white p-6 rounded-xl shadow-lg flex flex-col z-50';
    installBanner.style.zIndex = '9999';
    
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
        overlay.style.opacity = '0';
        setTimeout(() => {
          overlay.remove();
          installBanner.remove();
        }, 300);
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
          }
          overlay.style.opacity = '0';
          setTimeout(() => {
            overlay.remove();
            installBanner.remove();
          }, 300);
        }
      });
    }
  });

  // iOS banner con overlay
  if (isIOS() && !isInStandaloneMode()) {
    const overlay = createDarkOverlay();
    
    const iosBanner = document.createElement('div');
    iosBanner.id = 'ios-install-banner';
    iosBanner.className = 'fixed bottom-4 left-4 right-4 bg-white p-6 rounded-xl shadow-lg z-50';
    iosBanner.style.zIndex = '9999';
    
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
        overlay.style.opacity = '0';
        setTimeout(() => {
          overlay.remove();
          iosBanner.remove();
        }, 300);
        localStorage.setItem('banner-closed', Date.now().toString());
      });
    }
  }

  // Event listener per l'installazione completata
  window.addEventListener('appinstalled', async () => {
    localStorage.setItem('pwa-installed', 'true');
    localStorage.setItem('app-version', APP_VERSION);
    console.log('PWA installed successfully');
    setTimeout(async () => {
      await attemptPWARedirect();
    }, 2000);
  });

  // iOS specific handlers
  if (isIOS()) {
    window.addEventListener('load', async () => {
      if ((window.navigator as any).standalone) {
        localStorage.setItem('pwa-installed', 'true');
      }
    });

    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState === 'visible') {
        if ((window.navigator as any).standalone) {
          localStorage.setItem('pwa-installed', 'true');
        }
        setTimeout(async () => {
          await attemptPWARedirect();
        }, 1000);
      }
    });
  }
}

// Service Worker registration
if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
  if ('serviceWorker' in navigator) {
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

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }

  serviceWorkerRegistration.register();

  window.addEventListener('online', async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      registration.update();
    }
  });

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
