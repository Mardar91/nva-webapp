import React, { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Home, Pizza, Handshake } from "lucide-react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isIOS = useRef(/iPad|iPhone|iPod/.test(navigator.userAgent));
  const isSilentRef = useRef(false);

  useEffect(() => {
    // Creiamo un pool di elementi audio per iOS
    if (isIOS.current) {
      audioRef.current = new Audio('/sounds/click.wav');
      audioRef.current.preload = 'auto';
      // Precarica multipli elementi audio per iOS
      for (let i = 0; i < 3; i++) {
        const audio = new Audio('/sounds/click.wav');
        audio.preload = 'auto';
        audio.load();
      }
    } else {
      // Per altri browser, un singolo elemento è sufficiente
      audioRef.current = new Audio('/sounds/click.wav');
      audioRef.current.preload = 'auto';

      // Aggiungiamo il listener per il MediaSession API (Android)
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', () => {
          isSilentRef.current = false;
        });
        navigator.mediaSession.setActionHandler('pause', () => {
          isSilentRef.current = true;
        });
      }
    }

    // Prova a precaricare l'audio
    const preloadAudio = () => {
      if (audioRef.current) {
        audioRef.current.load();
      }
    };

    // Precarica al primo tocco/click
    document.addEventListener('touchstart', preloadAudio, { once: true });
    document.addEventListener('click', preloadAudio, { once: true });

    return () => {
      document.removeEventListener('touchstart', preloadAudio);
      document.removeEventListener('click', preloadAudio);
      audioRef.current = null;
    };
  }, []);

  const handleNavClick = () => {
    if (isIOS.current) {
      // Su iOS, verifica la modalità silenziosa tentando di riprodurre l'audio
      const tempAudio = new Audio('/sounds/click.wav');
      tempAudio.volume = 0.01;
      const playPromise = tempAudio.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          // Se la riproduzione ha successo, il dispositivo non è in modalità silenziosa
          tempAudio.pause();
          const audio = new Audio('/sounds/click.wav');
          audio.volume = 1;
          audio.play().catch(() => {});
        }).catch(() => {
          // Se la riproduzione fallisce, il dispositivo è probabilmente in modalità silenziosa
          isSilentRef.current = true;
        });
      }
    } else if (audioRef.current && !isSilentRef.current) {
      // Per altri browser, riproduci solo se non in modalità silenziosa
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
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
