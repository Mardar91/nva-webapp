import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Home, Map, Pizza, Handshake } from "lucide-react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  const getButtonClass = (path: string) =>
    location.pathname === path
      ? "text-[#6699ff]"
      : "text-blue-900";

  const isIframePage = ['/taxi', '/shop', '/gift-card'].includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen relative">
      <main className={`flex-1 ${isIframePage ? '' : 'overflow-y-auto pb-24'}`}>
        {children}
      </main>
      <nav 
        className="bg-gray-100 fixed bottom-0 left-0 right-0 z-50"
        style={{
          paddingTop: "0.75rem",
          paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))",
          height: "88px",
          boxShadow: '0 -2px 10px rgba(0,0,0,0.1)' // Aggiunge un'ombra sottile
        }}
      >
        <div className="flex justify-center space-x-4">
          <Link to="/">
            <Button variant="ghost">
              <div className={`flex flex-col items-center ${getButtonClass("/")}`}>
                <Home className="w-6 h-6 mb-1" />
                Home
              </div>
            </Button>
          </Link>
          <Link to="/restaurants">
            <Button variant="ghost">
              <div className={`flex flex-col items-center ${getButtonClass("/restaurants")}`}>
                <Pizza className="w-6 h-6 mb-1" />
                Restaurants
              </div>
            </Button>
          </Link>
          <Link to="/partners">
            <Button variant="ghost">
              <div className={`flex flex-col items-center ${getButtonClass("/partners")}`}>
                <Handshake className="w-6 h-6 mb-1" />
                Partners
              </div>
            </Button>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
