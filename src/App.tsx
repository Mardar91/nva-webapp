import React, { useEffect } from "react";
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
  return (
    <div className="flex-grow h-full">
      <iframe 
        src={src} 
        className="w-full h-full" 
        title={title}
        style={{
          height: "calc(100vh - 88px)",
          marginBottom: "88px",
          border: "none",
          display: "block"
        }}
      />
    </div>
  );
};

const App: React.FC = () => {
  useEffect(() => {
    serviceWorkerRegistration.register();

    const handleOnline = () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          registration.update();
        });
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          registration.update();
        });
      }
    };

    window.addEventListener('online', handleOnline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <Router>
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
            path="/shop"
            element={
              <IframeView
                src="https://store.nonnavittoriaapartments.it"
                title="Shop"
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
