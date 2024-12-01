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

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed',
    platform: string
  }>;
  prompt(): Promise<void>;
}

const App: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Controlla se l'app è in modalità standalone
    const checkStandalone = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone ||
                          document.referrer.includes('android-app://');
      setIsStandalone(isStandalone);
    };

    checkStandalone();

    // Ascolta i cambiamenti della modalità display
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addListener(checkStandalone);

    // Gestione beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Se non siamo già in modalità standalone, mostra il prompt
      if (!isStandalone) {
        // Attendiamo un momento per assicurarci che l'utente abbia interagito con la pagina
        setTimeout(() => {
          showInstallPrompt();
        }, 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Gestione appinstalled
    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null);
      // Redirect alla home dopo l'installazione
      window.location.href = '/';
    });

    // Cleanup
    return () => {
      mediaQuery.removeListener(checkStandalone);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isStandalone]);

  const showInstallPrompt = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error('Error showing install prompt:', err);
      }
    }
  };

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

    updateStatusBarColor();
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeMediaQuery.addListener(updateStatusBarColor);

    // Service Worker registration con gestione degli aggiornamenti
    serviceWorkerRegistration.register();

    return () => {
      darkModeMediaQuery.removeListener(updateStatusBarColor);
    };
  }, []);

  // Componenti per l'iframe
  interface IframeViewProps {
    src: string;
    title: string;
  }

  const IframeView: React.FC<IframeViewProps> = ({ src, title }) => {
    useEffect(() => {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'auto';
      };
    }, []);

    return (
      <div className="iframe-container">
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
