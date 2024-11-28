import React, { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Home, Pizza, Handshake } from "lucide-react";

// Audio instance con gestione lazy loading
const createAudio = () => {
  const audio = new Audio('https://nonnavittoriaapartments.it/click.mp3');
  audio.preload = 'auto';
  return audio;
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const audioEnabled = useRef(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isIOS = useRef(/iPad|iPhone|iPod/.test(navigator.userAgent));

  useEffect(() => {
    // Inizializza l'audio solo al primo tocco dell'utente per iOS
    const initAudio = () => {
      if (!audioRef.current) {
        audioRef.current = createAudio();
        // Prova a riprodurre un suono silenzioso per sbloccare l'audio su iOS
        if (isIOS.current) {
          audioRef.current.volume = 0;
          audioRef.current.play().then(() => {
            if (audioRef.current) audioRef.current.volume = 1;
          }).catch(() => {
            audioEnabled.current = false;
          });
        }
      }
    };

    // Aggiungi listener per il primo tocco
    document.addEventListener('touchstart', initAudio, { once: true });
    document.addEventListener('click', initAudio, { once: true });

    return () => {
      document.removeEventListener('touchstart', initAudio);
      document.removeEventListener('click', initAudio);
    };
  }, []);

  // Funzione per gestire il click con suono
  const handleNavClick = () => {
    try {
      if (audioEnabled.current && audioRef.current) {
        audioRef.current.currentTime = 0;
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Se la riproduzione fallisce, ricrea l'istanza audio
            audioRef.current = createAudio();
            audioEnabled.current = true;
          });
        }
      }
    } catch (error) {
      console.log('Audio playback error:', error);
      audioEnabled.current = false;
    }
  };
  
  const getButtonClass = (path: string) =>
    location.pathname === path
      ? "text-[#6699ff]"
      : "text-blue-900 dark:text-gray-200";

  const isIframePage = ['/taxi', '/shop', '/gift-card'].includes(location.pathname);

  return (
    <div 
      className="fixed inset-0 flex flex-col" 
      style={{ 
        background: '#f3f4f6',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      <div 
        className={`flex-1 ${isIframePage ? '' : ''}`}
        style={{
          height: `calc(100% - 88px)`,
          overflowY: 'auto',
          overscrollBehavior: 'none',
          WebkitOverflowScrolling: 'touch',
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: `calc(env(safe-area-inset-bottom) + 88px)`
        }}
      >
        {children}
      </div>

      <nav 
        className="bg-gray-100 dark:bg-gray-900 fixed bottom-0 left-0 right-0 z-50"
        style={{
          paddingTop: "0.75rem",
          paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))",
          height: "88px",
          boxShadow: '0 -2px 10px rgba(0,0,0,0.1)'
        }}
      >
        <div className="flex justify-center space-x-4">
          <Link to="/" onClick={handleNavClick}>
            <Button 
              variant="ghost" 
              className="dark:hover:bg-transparent dark:focus:bg-transparent dark:active:bg-transparent"
            >
              <div className={`flex flex-col items-center ${getButtonClass("/")}`}>
                <Home className="w-6 h-6 mb-1" />
                Home
              </div>
            </Button>
          </Link>
          <Link to="/restaurants" onClick={handleNavClick}>
            <Button 
              variant="ghost"
              className="dark:hover:bg-transparent dark:focus:bg-transparent dark:active:bg-transparent"
            >
              <div className={`flex flex-col items-center ${getButtonClass("/restaurants")}`}>
                <Pizza className="w-6 h-6 mb-1" />
                Restaurants
              </div>
            </Button>
          </Link>
          <Link to="/partners" onClick={handleNavClick}>
            <Button 
              variant="ghost"
              className="dark:hover:bg-transparent dark:focus:bg-transparent dark:active:bg-transparent"
            >
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
