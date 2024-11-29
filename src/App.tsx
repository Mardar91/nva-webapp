import React, { useEffect, useState } from "react";
import "./styles.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import * as serviceWorkerRegistration from './lib/serviceWorkerRegistration';
import Home from "./pages/Home";
import Restaurants from "./pages/Restaurants";
import Explore from "./pages/Explore";
import BookNow from "./pages/BookNow";
import CheckIn from "./pages/CheckIn";
import Partners from "./pages/Partners";
import Layout from "./components/Layout";

// Interfacce
interface ExternalRedirectProps {
  to: string;
}

interface IframeViewProps {
  src: string;
  title: string;
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Componente per la gestione dei redirect esterni
const ExternalRedirect: React.FC<ExternalRedirectProps> = ({ to }) => {
  React.useEffect(() => {
    // Pulisce l'URL dai parametri PWA prima del redirect
    const cleanUrl = new URL(to);
    cleanUrl.searchParams.delete('source');
    cleanUrl.searchParams.delete('pwa');
    window.location.href = cleanUrl.toString();
  }, [to]);
  return null;
};

// Componente per la visualizzazione degli iframe
const IframeView: React.FC<IframeViewProps> = ({ src, title }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const safeAreaBottom = getComputedStyle(document.documentElement)
      .getPropertyValue('--safe-area-inset-bottom');
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div 
      className="iframe-container prevent-overscroll" 
      style={{
        position: 'fixed',
        top: 'var(--safe-area-inset-top, 0px)',
        left: 0,
        right: 0,
        bottom: 'calc(88px + var(--safe-area-inset-bottom, 0px))',
        overflow: 'hidden',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <iframe 
        src={src} 
        title={title}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
        scrolling="yes"
        allow="fullscreen"
      />
    </div>
  );
};
const App: React.FC = () => {
  // Stati per la gestione PWA
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Controlla se l'app è in modalità standalone o PWA
    const checkStandalone = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone === true;
      setIsStandalone(isStandalone);

      // Se siamo in modalità standalone, l'app è installata
      if (isStandalone) {
        setIsPWAInstalled(true);
        localStorage.setItem('pwa-installed', 'true');
      }
    };

    // Gestione colore barra di stato
    const updateStatusBarColor = () => {
      const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const themeColor = document.querySelector('meta[name="theme-color"]');
      
      if (themeColor) {
        themeColor.setAttribute(
          'content',
          darkModeMediaQuery.matches ? '#1a1a1a' : '#ffffff'
        );
      }
    };

    // Gestione installazione PWA
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Gestione completamento installazione
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsPWAInstalled(true);
      localStorage.setItem('pwa-installed', 'true');
      console.log('PWA installata con successo');
    };

    // Gestione aggiornamento Service Worker
    const handleServiceWorkerUpdate = () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          registration.update().catch(error => {
            console.error('Errore aggiornamento Service Worker:', error);
          });
        });
      }
    };

    // Inizializzazione
    checkStandalone();
    updateStatusBarColor();

    // Event listeners
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeMediaQuery.addListener(updateStatusBarColor);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleServiceWorkerUpdate);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        handleServiceWorkerUpdate();
      }
    });

    // Registrazione Service Worker
    serviceWorkerRegistration.register({
      onUpdate: (registration) => {
        // Notifica l'utente dell'aggiornamento disponibile
        const shouldUpdate = window.confirm(
          'È disponibile una nuova versione. Vuoi aggiornare?'
        );
        if (shouldUpdate && registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      },
    });

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleServiceWorkerUpdate);
      document.removeEventListener('visibilitychange', handleServiceWorkerUpdate);
      darkModeMediaQuery.removeListener(updateStatusBarColor);
    };
  }, []);

  // Prevenzione redirect infinito
  useEffect(() => {
    const currentUrl = new URL(window.location.href);
    if (currentUrl.searchParams.has('pwa')) {
      currentUrl.searchParams.delete('pwa');
      window.history.replaceState({}, '', currentUrl.toString());
    }
  }, []);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/restaurants" element={<Restaurants />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/book" element={<BookNow />} />
          <Route path="/check-in" element={<CheckIn />} />
          <Route path="/partners" element={<Partners />} />
          <Route
            path="/taxi"
            element={
              <IframeView
                src="https://meet.brevo.com/nonnavittoria-transfer"
                title="Taxi Service"
              />
            }
          />
          <Route
            path="/gift-card"
            element={
              <IframeView
                src="https://giftup.app/place-order/4bed8e87-1ecc-466c-4d3d-08db98c3a095"
                title="Gift Card"
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
