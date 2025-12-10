import React, { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, UtensilsCrossed, Handshake, Map } from "lucide-react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isIOS = useRef(/iPad|iPhone|iPod/.test(navigator.userAgent));

  useEffect(() => {
    if (isIOS.current) {
      audioRef.current = new Audio('/sounds/click.wav');
      audioRef.current.preload = 'auto';
      for (let i = 0; i < 3; i++) {
        const audio = new Audio('/sounds/click.wav');
        audio.preload = 'auto';
        audio.load();
      }
    } else {
      audioRef.current = new Audio('/sounds/click.wav');
      audioRef.current.preload = 'auto';
    }

    const preloadAudio = () => {
      if (audioRef.current) {
        audioRef.current.load();
      }
    };

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
      const audio = new Audio('/sounds/click.wav');
      audio.play().catch(() => {});
    } else if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/restaurants", label: "Restaurants", icon: UtensilsCrossed },
    { path: "/partners", label: "Partners", icon: Handshake },
    { path: "/explore", label: "Explore", icon: Map },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{
        background: '#f9fafb',
      }}
    >
      <div className="flex-1 relative">
        {children}
      </div>

      {/* Modern Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* Glassmorphism Background */}
        <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50" />

        {/* Nav Content */}
        <div className="relative flex items-center justify-center gap-4 px-4 py-3 max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                className="flex flex-col items-center justify-center min-w-[64px] transition-all duration-200 active:scale-95"
              >
                {/* Icon Container */}
                <div className={`relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 ${
                  active
                    ? 'bg-blue-100 dark:bg-blue-900/50'
                    : ''
                }`}>
                  <Icon
                    className={`w-5 h-5 transition-colors duration-200 ${
                      active
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                    strokeWidth={active ? 2.5 : 2}
                  />
                </div>

                {/* Label */}
                <span className={`text-[10px] mt-0.5 font-medium transition-colors duration-200 ${
                  active
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;