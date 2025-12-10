import React, { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, UtensilsCrossed, Handshake } from "lucide-react";

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
          height: "88px",
        }}
      >
        {/* Glassmorphism Background */}
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50" />

        {/* Nav Content */}
        <div className="relative h-full flex items-center justify-around px-6 max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                className="flex flex-col items-center justify-center py-2 px-4 rounded-2xl transition-all duration-300 active:scale-95"
              >
                {/* Icon Container with Active Indicator */}
                <div className={`relative p-2 rounded-xl transition-all duration-300 ${
                  active
                    ? 'bg-blue-100 dark:bg-blue-900/50'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}>
                  <Icon
                    className={`w-6 h-6 transition-colors duration-300 ${
                      active
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                    strokeWidth={active ? 2.5 : 2}
                  />

                  {/* Active Dot Indicator */}
                  {active && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full" />
                  )}
                </div>

                {/* Label */}
                <span className={`text-[11px] mt-1 font-medium transition-colors duration-300 ${
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