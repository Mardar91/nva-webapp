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

  return (
    <div className="fixed inset-0 flex flex-col">
      <div className="flex-grow overflow-auto">{children}</div>
      <div 
        className="bg-gray-100 z-50"
        style={{
          paddingTop: "0.5rem", // Ridotto da 1rem a 0.5rem
          paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))", // Ridotto da 1rem a 0.5rem
        }}
      >
        <div className="flex justify-center space-x-4">
          <Link to="/">
            <Button 
              variant="ghost" 
              className="h-auto py-1" // Aggiunto per ridurre l'altezza del bottone
            >
              <div
                className={`flex flex-col items-center ${getButtonClass("/")}`}
              >
                <Home className="w-5 h-5 mb-0.5" // Ridotto da w-6 h-6 mb-1
                />
                <span className="text-sm">Home</span> {/* Ridotto il testo */}
              </div>
            </Button>
          </Link>
          <Link to="/restaurants">
            <Button 
              variant="ghost"
              className="h-auto py-1"
            >
              <div
                className={`flex flex-col items-center ${getButtonClass(
                  "/restaurants"
                )}`}
              >
                <Pizza className="w-5 h-5 mb-0.5" />
                <span className="text-sm">Restaurants</span>
              </div>
            </Button>
          </Link>
          <Link to="/partners">
            <Button 
              variant="ghost"
              className="h-auto py-1"
            >
              <div
                className={`flex flex-col items-center ${getButtonClass(
                  "/partners"
                )}`}
              >
                <Handshake className="w-5 h-5 mb-0.5" />
                <span className="text-sm">Partners</span>
              </div>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Layout;
