import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import App from "./App";

// Registrazione del Service Worker
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && window.location.hostname !== 'localhost') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/serviceWorker.js')
      .then(registration => {
        console.log('ServiceWorker registration successful:', registration);
      })
      .catch(err => {
        console.error('ServiceWorker registration failed:', err);
      });
  });
}

// Gestione dell'installazione PWA
let deferredPrompt: any;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Crea il banner di installazione
    const installBanner = document.createElement('div');
    installBanner.id = 'install-banner';
    installBanner.className = 'fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg flex justify-between items-center z-50';
    
    installBanner.innerHTML = `
      <div>Vuoi installare l'app di Nonna Vittoria Apartments?</div>
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
          console.log(`User response to the install prompt: ${outcome}`);
          deferredPrompt = null;
          installBanner.remove();
        }
      });
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
