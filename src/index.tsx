import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import App from "./App";
import * as serviceWorkerRegistration from './lib/serviceWorkerRegistration';

// Utility functions for platform detection
const isIOS = () => {
  if (typeof window !== 'undefined') {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
  }
  return false;
};

const isInStandaloneMode = () => 
  typeof window !== 'undefined' && 
  ('standalone' in window.navigator) && 
  (window.navigator['standalone'] as boolean);

// PWA installation handling
if (typeof window !== 'undefined') {
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
            installBanner.remove();
          }
        }
      });
    }
  });

  // iOS/Safari banner
  window.addEventListener('load', () => {
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
          // Show banner again after 24 hours
          setTimeout(() => {
            window.dispatchEvent(new Event('load'));
          }, 24 * 60 * 60 * 1000);
        });
      }
    }
  });
}

// Service Worker registration and update handling
if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
  serviceWorkerRegistration.register();

  window.addEventListener('online', () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.update();
      });
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.update();
      });
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
