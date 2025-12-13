import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "./styles.css";
import "./i18n";
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
import AutoLogin from "./pages/AutoLogin";
import Layout from "./components/Layout";
import PrivateSettings from "./components/PrivateSettings";
import MolaDiBari from "./pages/cities/MolaDiBari";
import PoliganoAMare from "./pages/cities/PoliganoAMare";
import Monopoli from "./pages/cities/Monopoli";
import Bari from "./pages/cities/Bari";
import MyStay from "./pages/MyStay";
import GiftCards from "./pages/GiftCards";

interface ExternalRedirectProps {
  to: string;
}

const ExternalRedirect: React.FC<ExternalRedirectProps> = ({ to }) => {
  React.useEffect(() => {
    window.location.href = to;
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
    <div className="iframe-container" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 'calc(72px + env(safe-area-inset-bottom))',
      overflow: 'hidden',
      WebkitOverflowScrolling: 'touch',
    }}>
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

const AppContent: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/restaurants" element={<Restaurants />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/book" element={<BookNow />} />
        <Route path="/check-in" element={<CheckIn />} />
        <Route path="/my-stay" element={<MyStay />} />
        <Route path="/auto-login" element={<AutoLogin />} />
        <Route path="/partners" element={<Partners />} />
        <Route path="/privatesettings/private" element={<PrivateSettings />} />
        <Route path="/cities/mola-di-bari" element={<MolaDiBari />} />
        <Route path="/cities/polignano-a-mare" element={<PoliganoAMare />} />
        <Route path="/cities/monopoli" element={<Monopoli />} />
        <Route path="/cities/bari" element={<Bari />} />
        <Route
          path="/taxi"
          element={
            <IframeView
              src="https://meet.brevo.com/nonnavittoria-transfer"
              title={t('app.taxiService')}
            />
          }
        />
        <Route path="/gift-card" element={<GiftCards />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  // Configura i gestori degli eventi OneSignal
  if (typeof window !== 'undefined' && window.OneSignal) {
    window.OneSignalDeferred.push(function(OneSignal) {
      // Gestione click sulle notifiche
      OneSignal.Notifications.addEventListener('click', function(event) {
        const { url, additionalData } = event.notification;

        // 🔐 Handle checkin_linked notification for auto-login
        if (additionalData?.type === 'checkin_linked' && additionalData?.token) {
          console.log('📲 Checkin linked notification clicked - saving token for auto-login');
          // Save token to localStorage for auto-login on next page load
          localStorage.setItem('nva_pending_login_token', additionalData.token);
        }

        if (url) {
          window.location.href = url;
        }
      });

      // Gestione notifiche in primo piano - versione corretta
      OneSignal.Notifications.addEventListener('foregroundWillDisplay', function(event) {
        const { additionalData } = event.notification;

        // 🔐 Handle checkin_linked notification for auto-login (foreground)
        if (additionalData?.type === 'checkin_linked' && additionalData?.token) {
          console.log('📲 Checkin linked notification received in foreground - saving token');
          localStorage.setItem('nva_pending_login_token', additionalData.token);
          // Trigger a custom event so useGuestSession can pick it up immediately
          window.dispatchEvent(new CustomEvent('nva_pending_login_token_set'));
        }

        // Mostra la notifica dopo un breve ritardo
        setTimeout(() => {
          event.notification.display();
        }, 500);
      });

      // Gestione cambi di permesso
      OneSignal.Notifications.addEventListener('permissionChange', function(permission) {
        console.log('Notification permission changed:', permission);
      });
    });
  }

    const themeColor = document.querySelector('meta[name="theme-color"]');
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const isInTaxiRoute = window.location.pathname === '/taxi';
    
    if (themeColor) {
      if (isInTaxiRoute) {
        const taxiColor = darkModeMediaQuery.matches ? '#1a1a1a' : '#fbbf24';
        themeColor.setAttribute('content', taxiColor);
      } else {
        const initialColor = darkModeMediaQuery.matches ? '#1a1a1a' : '#1e3a8a';
        themeColor.setAttribute('content', initialColor);
      }
    }

    const splashScreen = document.getElementById('splash-screen');
    
    if (isInTaxiRoute) {
      if (splashScreen) {
        splashScreen.style.display = 'none';
      }
      setLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      if (splashScreen) {
        splashScreen.classList.add('fade-out');
        setTimeout(() => {
          setLoading(false);
          if (splashScreen) {
            splashScreen.style.display = 'none';
          }
          
          if (themeColor) {
            const currentPath = window.location.pathname;
            let color;
            
            if (darkModeMediaQuery.matches) {
              color = '#1a1a1a';
            } else {
              color = currentPath === '/' ? '#ffffff' : '#ffffff';
            }
            
            themeColor.setAttribute('content', color);
          }
        }, 500);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    serviceWorkerRegistration.register();

    const updateStatusBarColor = () => {
      if (!loading) {
        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const themeColor = document.querySelector('meta[name="theme-color"]');
        
        if (themeColor) {
          const path = window.location.pathname;
          let color;
          
          if (darkModeMediaQuery.matches) {
            color = '#1a1a1a';
          } else {
            color = path === '/' ? '#ffffff' : '#ffffff';
          }
          
          themeColor.setAttribute('content', color);
        }
      }
    };

    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeMediaQuery.addListener(updateStatusBarColor);

    return () => {
      darkModeMediaQuery.removeListener(updateStatusBarColor);
    };
  }, [loading]);

  if (loading) {
    return null;
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppContent />
    </Router>
  );
};

export default App;
