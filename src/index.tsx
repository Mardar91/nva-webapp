import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import App from "./App";
import * as serviceWorkerRegistration from './lib/serviceWorkerRegistration';

declare global {
  interface Window {
    OneSignal: any;
    oneSignalInitialized?: boolean;
  }
}

// Gestione dello stato di inizializzazione di OneSignal
const ONE_SIGNAL_INIT_KEY = 'oneSignalInitialized';

// Helper function per verificare se OneSignal è già stato inizializzato
const isOneSignalInitialized = (): boolean => {
  return window.oneSignalInitialized || 
         sessionStorage.getItem(ONE_SIGNAL_INIT_KEY) === 'true';
};

// Helper function per impostare lo stato di inizializzazione
const setOneSignalInitialized = () => {
  window.oneSignalInitialized = true;
  sessionStorage.setItem(ONE_SIGNAL_INIT_KEY, 'true');
};

// Helper function to load OneSignal script with retry mechanism
const loadOneSignalScript = async (retries = 3): Promise<void> => {
  if (typeof window === 'undefined') return;
  
  const existingScript = document.querySelector('script[src*="OneSignalSDK.page.js"]');
  if (existingScript) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
    script.async = true;
    
    let retryCount = 0;
    
    script.onload = () => {
      console.log('OneSignal script loaded successfully');
      resolve();
    };
    
    script.onerror = async (error) => {
      console.error('Error loading OneSignal script:', error);
      if (retryCount < retries) {
        retryCount++;
        console.log(`Retrying OneSignal script load (${retryCount}/${retries})`);
        try {
          await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
          await loadOneSignalScript(retries - 1);
          resolve();
        } catch (retryError) {
          reject(retryError);
        }
      } else {
        reject(error);
      }
    };
    
    document.head.appendChild(script);
  });
};

// OneSignal Initialization with minimal configuration
const initializeOneSignal = async (): Promise<void> => {
  if (typeof window === 'undefined' || isOneSignalInitialized()) {
    console.log('OneSignal already initialized or window undefined');
    return;
  }

  try {
    await loadOneSignalScript();
    
    if (!window.OneSignal) {
      throw new Error('OneSignal object not available after script load');
    }

    // Reset OneSignal if it was previously initialized
    if (window.OneSignal.initialized) {
      await window.OneSignal.shutdown();
    }
    
    window.OneSignal = window.OneSignal || [];
    
    return new Promise((resolve, reject) => {
      window.OneSignal.push(() => {
        window.OneSignal.init({
          appId: "8d05cb31-99c9-4dd2-a2a9-8e7fb838fb8a",
          allowLocalhostAsSecureOrigin: true,
          serviceWorkerPath: "/OneSignalSDKWorker.js",
          serviceWorkerParam: { scope: "/" }
        })
        .then(() => {
          setOneSignalInitialized();
          resolve();
        })
        .catch((error: any) => {
          console.error("OneSignal initialization error:", error);
          reject(error);
        });
      });
    });
  } catch (error) {
    console.error("Critical error during OneSignal initialization:", error);
    throw error;
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

const isInStandaloneMode = () => 
  typeof window !== 'undefined' && 
  (window.matchMedia('(display-mode: standalone)').matches || 
   ('standalone' in window.navigator && (window.navigator as any).standalone));

const isPWAInstalled = () => {
  if (typeof window === 'undefined') return false;
  
  return localStorage.getItem('pwa-installed') === 'true' || 
         isInStandaloneMode() ||
         window.matchMedia('(display-mode: standalone)').matches;
};

// PWA installation and redirection handling
if (typeof window !== 'undefined') {
  // Initialize OneSignal only once when the page loads
  let oneSignalInitialized = false;
  window.addEventListener('load', () => {
    if (!oneSignalInitialized) {
      initializeOneSignal().then(() => {
        oneSignalInitialized = true;
      });
    }
  });

  // Store original URL
  const originalUrl = window.location.href;
  
  const attemptPWARedirect = () => {
    if (!isInStandaloneMode() && isPWAInstalled()) {
      const pwaUrl = new URL(originalUrl);
      pwaUrl.searchParams.set('pwa', 'true');
      pwaUrl.searchParams.set('t', Date.now().toString());
      
      if (isIOS()) {
        window.location.href = pwaUrl.toString();
      } else {
        window.location.replace(pwaUrl.toString());
      }
    }
  };

  // iOS specific handlers
  if (isIOS()) {
    window.addEventListener('load', () => {
      if ((window.navigator as any).standalone) {
        localStorage.setItem('pwa-installed', 'true');
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        if ((window.navigator as any).standalone) {
          localStorage.setItem('pwa-installed', 'true');
        }
        attemptPWARedirect();
      }
    });
  }

  // Installation tracking
  window.addEventListener('appinstalled', (evt) => {
    localStorage.setItem('pwa-installed', 'true');
    console.log('PWA installed successfully');
    attemptPWARedirect();
  });

  window.matchMedia('(display-mode: standalone)').addEventListener('change', (evt) => {
    if (evt.matches) {
      localStorage.setItem('pwa-installed', 'true');
      attemptPWARedirect();
    }
  });

  // Initial redirect attempt
  window.addEventListener('load', attemptPWARedirect);

