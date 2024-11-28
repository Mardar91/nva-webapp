import React, { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Home, Pizza, Handshake } from "lucide-react";

// Definizione del tipo per il contesto audio
type AudioContextType = typeof window !== 'undefined' ? 
  (window.AudioContext || window.webkitAudioContext) : null;

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const isIOS = useRef(/iPad|iPhone|iPod/.test(navigator.userAgent));
  const isSafari = useRef(/^((?!chrome|android).)*safari/i.test(navigator.userAgent));

  useEffect(() => {
    // Inizializza il contesto audio
    const initAudio = async () => {
      try {
        if (!audioContextRef.current) {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          audioContextRef.current = new AudioContextClass();
          
          // Carica il file audio
          const response = await fetch('https://nonnavittoriaapartments.it/click.mp3');
          const arrayBuffer = await response.arrayBuffer();
          audioBufferRef.current = await audioContextRef.current.decodeAudioData(arrayBuffer);
        }

        // Su iOS/Safari, riprova a iniziare il contesto audio se era sospeso
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }
      } catch (error) {
        console.log('Audio initialization error:', error);
      }
    };

    // Inizializza l'audio al caricamento e al primo tocco
    const handleFirstInteraction = () => {
      initAudio();
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('click', handleFirstInteraction);
    };

    document.addEventListener('touchstart', handleFirstInteraction);
    document.addEventListener('click', handleFirstInteraction);
    initAudio();

    return () => {
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('click', handleFirstInteraction);
    };
  }, []);

  const playSound = async () => {
    try {
      if (audioContextRef.current && audioBufferRef.current) {
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }
        
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBufferRef.current;
        source.connect(audioContextRef.current.destination);
        source.start(0);
      }
    } catch (error) {
      console.log('Playback error:', error);
    }
  };

  const handleNavClick = () => {
    playSound();
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
