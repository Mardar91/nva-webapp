import React, { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Home, Pizza, Handshake } from "lucide-react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isIOS = useRef(/iPad|iPhone|iPod/.test(navigator.userAgent));
  const isAudioEnabled = useRef(false);

  useEffect(() => {
    // Funzione per inizializzare l'audio
    const initAudio = async () => {
      if (!audioRef.current) {
        audioRef.current = new Audio('/sounds/click.mp3');
        audioRef.current.preload = 'auto';
        
        if (isIOS.current) {
          try {
            // Su iOS riproduciamo inizialmente con volume 0
            audioRef.current.volume = 0;
            await audioRef.current.play();
            audioRef.current.pause();
            audioRef.current.volume = 1;
            isAudioEnabled.current = true;
          } catch (error) {
            console.log('iOS audio initialization failed:', error);
          }
        } else {
          isAudioEnabled.current = true;
        }
      }
    };

    // Gestori per l'interazione utente
    const handleUserInteraction = async () => {
      if (!isAudioEnabled.current) {
        await initAudio();
      }
    };

    // Aggiungi listener per vari eventi di interazione
    const events = ['touchstart', 'touchend', 'click', 'mousedown', 'keydown'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true });
    });

    // Inizializza comunque
    initAudio();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, []);

  const handleNavClick = async () => {
    if (audioRef.current && isAudioEnabled.current) {
      try {
        if (isIOS.current) {
          // Su iOS, ricrea l'elemento audio per ogni click
          const tempAudio = new Audio('/sounds/click.mp3');
          await tempAudio.play();
        } else {
          audioRef.current.currentTime = 0;
          await audioRef.current.play();
        }
      } catch (error) {
        console.log('Playback error:', error);
      }
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
