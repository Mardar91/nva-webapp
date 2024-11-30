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

const App: React.FC = () => {
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

   // Esegui subito
   updateStatusBarColor();

   // Ascolta i cambiamenti del tema
   const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
   darkModeMediaQuery.addListener(updateStatusBarColor);

   // Service Worker registration
   serviceWorkerRegistration.register();

   // Cleanup
   return () => {
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
