import React, { useEffect, useState } from "react";
import "./styles.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import * as serviceWorkerRegistration from './lib/serviceWorkerRegistration';
import Home from "./pages/Home";
import Restaurants from "./pages/Restaurants";
import Explore from "./pages/Explore";
import BookNow from "./pages/BookNow";
import CheckIn from "./pages/CheckIn";
import Partners from "./pages/Partners";
import Layout from "./components/Layout";

interface ExternalRedirectProps {
  to: string;
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const ExternalRedirect: React.FC<ExternalRedirectProps> = ({ to }) => {
  React.useEffect(() => {
    const cleanUrl = new URL(to);
    cleanUrl.searchParams.delete('source');
    cleanUrl.searchParams.delete('pwa');
    window.location.href = cleanUrl.toString();
  }, [to]);
  return null;
};

const IframeView: React.FC<{ src: string; title: string }> = ({
  src,
  title,
}) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div 
      className="iframe-container" 
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
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);

  // Effetto per rimuovere i parametri PWA
  useEffect(() => {
    if (window.location.search.includes('pwa=')) {
      const newUrl = window.location.pathname + 
                    window.location.search.replace(/[?&]pwa=[^&]+/, '') +
                    window.location.hash;
      window.history.replaceState(null, '', newUrl);
    }
  }, []);

  useEffect(() => {
    // Funzione per aggiornare il colore della barra di stato
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

    // Controllo modalità standalone/PWA
    const checkInstallState = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone === true;
      if (isStandalone) {
        setIsPWAInstalled(true);
        localStorage.setItem('pwa-installed', 'true');
      }
    };

    // Event listeners per PWA
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsPWAInstalled(true);
      localStorage.setItem('pwa-installed', 'true');
    };

    // Service Worker update handler
    const handleServiceWorkerUpdate = () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          registration.update();
        });
      }
    };

    // Inizializzazione
    checkInstallState();
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
    serviceWorkerRegistration.register();

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleServiceWorkerUpdate);
      document.removeEventListener('visibilitychange', handleServiceWorkerUpdate);
      darkModeMediaQuery.removeListener(updateStatusBarColor);
    };
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
