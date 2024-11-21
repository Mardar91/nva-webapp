import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import App from "./App";

// Funzioni di utilità per il rilevamento della piattaforma
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

// Registrazione del Service Worker
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && window.location.hostname !== 'localhost') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/serviceWorker.js')
      .then(registration => {
        console.log('ServiceWorker registrato con successo:', registration);
      })
      .catch(err => {
        console.error('Errore registrazione ServiceWorker:', err);
      });
  });
}

// Gestione installazione PWA
if (typeof window !== 'undefined') {
  let deferredPrompt: any;

  // Banner per Android/Chrome
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    const installBanner = document.createElement('div');
    installBanner.id = 'install-banner';
    installBanner.className = 'fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg flex justify-between items-center z-50';
    
    installBanner.innerHTML = `
      <div>Installa l'app di Nonna Vittoria Apartments per un accesso più veloce</div>
      <button id="install-button" class="bg-black text-white px-4 py-2 rounded">
        Installa
      </button>
    `;
    
    document.body.appendChild(installBanner);
    
    const installButton = document.getElementById('install-button');
    if (installButton) {
      installButton.addEventListener('click', async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          console.log(`Risposta utente al prompt di installazione: ${outcome}`);
          deferredPrompt = null;
          installBanner.remove();
        }
      });
    }
  });

  // Banner per iOS/Safari
  window.addEventListener('load', () => {
    if (isIOS() && !isInStandaloneMode()) {
      const iosBanner = document.createElement('div');
      iosBanner.id = 'ios-install-banner';
      iosBanner.className = 'fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg z-50';
      
      iosBanner.innerHTML = `
        <div class="flex flex-col items-center space-y-2">
          <div class="text-center font-bold">
            Installa l'app di Nonna Vittoria Apartments
          </div>
          <div class="flex items-center space-x-2">
            <div>1. Tocca il pulsante Condividi</div>
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M8.684 13.342C8.886 13.524 9.144 13.628 9.408 13.628C9.672 13.628 9.93 13.524 10.132 13.342L12 11.474L13.867 13.342C14.069 13.524 14.327 13.628 14.591 13.628C14.855 13.628 15.113 13.524 15.315 13.342C15.721 12.936 15.721 12.28 15.315 11.874L12.724 9.283C12.318 8.877 11.662 8.877 11.256 9.283L8.665 11.874C8.259 12.28 8.259 12.936 8.665 13.342H8.684Z" fill="currentColor"/>
            </svg>
          </div>
          <div>2. Scegli "Aggiungi alla schermata Home"</div>
          <button id="close-ios-banner" class="mt-2 px-4 py-2 bg-black text-white rounded">
            Ho capito
          </button>
        </div>
      `;
      
      document.body.appendChild(iosBanner);
      
      const closeButton = document.getElementById('close-ios-banner');
      if (closeButton) {
        closeButton.addEventListener('click', () => {
          iosBanner.remove();
          // Salva un flag nel localStorage per non mostrare più il banner
          localStorage.setItem('iosBannerClosed', 'true');
        });
      }
    }
  });
}

// Rendering dell'app
const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} else {
  console.error("Elemento con id 'root' non trovato nel DOM");
}
