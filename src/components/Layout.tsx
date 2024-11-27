import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Home, Pizza, Handshake } from "lucide-react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  const getButtonClass = (path: string) =>
    location.pathname === path
      ? "text-[#6699ff]"
      : "text-blue-900";

  const isIframePage = ['/taxi', '/shop', '/gift-card'].includes(location.pathname);

  return (
    <div 
      className="fixed inset-0 flex flex-col" 
      style={{ 
        background: '#f3f4f6',
        WebkitOverflowScrolling: 'touch',
        paddingTop: 'env(safe-area-inset-top)'
      }}
    >
      <div 
        className={`flex-1 ${isIframePage ? '' : ''}`}
        style={{
          height: `calc(100% - 64px)`, // Ridotto da 88px a 64px
          overflowY: 'auto',
          overscrollBehavior: 'none',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: `calc(env(safe-area-inset-bottom) + 64px)` // Aggiornato con la nuova altezza
        }}
      >
        {children}
      </div>

      <nav 
        className="bg-gray-100 fixed bottom-0 left-0 right-0 z-50"
        style={{
          paddingTop: "0.375rem", // Ridotto da 0.75rem
          paddingBottom: "calc(0.375rem + env(safe-area-inset-bottom))", // Ridotto da 0.5rem
          height: "64px", // Ridotto da 88px a 64px
          boxShadow: '0 -1px 3px rgba(0,0,0,0.1)'
        }}
      >
        <div className="flex justify-center space-x-4">
          <Link to="/">
            <Button 
              variant="ghost" 
              className="h-auto py-1 px-3"
            >
              <div className={`flex flex-col items-center ${getButtonClass("/")}`}>
                <Home className="w-5 h-5 mb-0.5" /> {/* Ridotto da w-6 h-6 mb-1 */}
                <span className="text-xs">Home</span> {/* Aggiunto text-xs per ridurre la dimensione del testo */}
              </div>
            </Button>
          </Link>
          <Link to="/restaurants">
            <Button 
              variant="ghost"
              className="h-auto py-1 px-3"
            >
              <div className={`flex flex-col items-center ${getButtonClass("/restaurants")}`}>
                <Pizza className="w-5 h-5 mb-0.5" />
                <span className="text-xs">Restaurants</span>
              </div>
            </Button>
          </Link>
          <Link to="/partners">
            <Button 
              variant="ghost"
              className="h-auto py-1 px-3"
            >
              <div className={`flex flex-col items-center ${getButtonClass("/partners")}`}>
                <Handshake className="w-5 h-5 mb-0.5" />
                <span className="text-xs">Partners</span>
              </div>
            </Button>
          </Link>
        </div>
      </nav>

      {/* Fix per iPhone con notch */}
      <style jsx global>{`
        @supports (-webkit-touch-callout: none) {
          .fixed.bottom-0 {
            padding-bottom: calc(env(safe-area-inset-bottom) + 0.375rem);
          }
        }
        
        @media (display-mode: standalone) {
          .fixed.bottom-0 {
            height: calc(64px + env(safe-area-inset-bottom));
          }
        }
      `}</style>
    </div>
  );
};

export default Layout;
