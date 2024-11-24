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
          paddingTop: "1.5rem", // Aumentato per spostare il contenuto più in basso
          paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))", // Ridotto per compensare
        }}
      >
        <div className="flex justify-center space-x-4">
          <Link to="/">
            <Button variant="ghost">
              <div
                className={`flex flex-col items-center ${getButtonClass("/")}`}
              >
                <Home className="w-6 h-6 mb-1" />
                Home
              </div>
            </Button>
          </Link>
          <Link to="/restaurants">
            <Button variant="ghost">
              <div
                className={`flex flex-col items-center ${getButtonClass(
                  "/restaurants"
                )}`}
              >
                <Pizza className="w-6 h-6 mb-1" />
                Restaurants
              </div>
            </Button>
          </Link>
          <Link to="/partners">
            <Button variant="ghost">
              <div
                className={`flex flex-col items-center ${getButtonClass(
                  "/partners"
                )}`}
              >
                <Handshake className="w-6 h-6 mb-1" />
                Partners
              </div>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Layout;
