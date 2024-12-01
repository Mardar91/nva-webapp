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
      bottom: '88px',
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
  return (
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
  );
};
const App: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const themeColor = document.querySelector('meta[name="theme-color"]');
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const isInTaxiRoute = window.location.pathname === '/taxi';
    
    // Colore iniziale sempre blu in light mode, dark in dark mode
    if (themeColor) {
      if (isInTaxiRoute) {
        const taxiColor = darkModeMediaQuery.matches ? '#1a1a1a' : '#fbbf24';
        themeColor.setAttribute('content', taxiColor);
      } else {
        // Durante lo splash screen, manteniamo il blu in light mode
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
              // Dopo lo splash screen, passa a bianco per la Home
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
