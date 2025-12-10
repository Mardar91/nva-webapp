// ============================================
// 📱 APP: NVA (React App)
// 📄 FILE: src/components/HeroSection.tsx
// 🔧 PURPOSE: Hero section with login bar
// ============================================

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, LogIn, Map, User, LogOut, ChevronDown } from "lucide-react";
import { useGuestSession } from "../hooks/useGuestSession";
import { useNotifications } from "../hooks/useNotifications";
import GuestLoginModal from "./GuestLoginModal";
import GuestChatDrawer from "./GuestChatDrawer";

const HeroSection = () => {
  const navigate = useNavigate();
  const {
    isLoggedIn,
    isLoading,
    token,
    guestName,
    error,
    login,
    logout,
  } = useGuestSession();

  // Get OneSignal deviceId for push notifications
  const { deviceId } = useNotifications();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen for custom event from FloatingChatButton to open chat
  useEffect(() => {
    const handleOpenGuestChat = () => {
      if (isLoggedIn) {
        setShowChatDrawer(true);
      }
    };

    window.addEventListener('openGuestChat', handleOpenGuestChat);
    return () => window.removeEventListener('openGuestChat', handleOpenGuestChat);
  }, [isLoggedIn]);

  const heroItems = [
    {
      title: "Book Now",
      icon: <Calendar size={32} color="#60A5FA" />,
      onClick: () => navigate("/book"),
    },
    {
      title: "Check-in",
      icon: <LogIn size={32} color="#60A5FA" />,
      onClick: () => navigate("/check-in"),
    },
    {
      title: "Explore",
      icon: <Map size={32} color="#60A5FA" />,
      onClick: () => navigate("/explore"),
    },
  ];

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const handleLogin = async (bookingRef: string, email: string): Promise<boolean> => {
    // Pass deviceId to channel manager for push notifications
    const success = await login(bookingRef, email, deviceId);
    return success;
  };

  const handleLogout = () => {
    logout();
    setShowChatDrawer(false);
    setShowUserMenu(false);
  };

  const handleSessionExpired = () => {
    logout();
    setShowChatDrawer(false);
    setShowLoginModal(true);
  };

  return (
    <>
      {/* Fixed Login Bar - Full width at top */}
      <div
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-700 to-blue-800 dark:from-blue-800 dark:to-blue-900"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="flex items-center justify-center px-4 py-2">
          {isLoggedIn ? (
            /* Logged in state - Name with dropdown */
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
              >
                <User className="h-4 w-4" />
                <span className="truncate max-w-[100px]">
                  {guestName || 'Guest'}
                </span>
                <ChevronDown className={`h-3 w-3 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-50">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Not logged in state */
            <button
              onClick={handleLoginClick}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
            >
              <User className="h-4 w-4" />
              Login
            </button>
          )}
        </div>
      </div>

      {/* Spacer for fixed bar */}
      <div
        className="w-full bg-gradient-to-r from-blue-700 to-blue-800 dark:from-blue-800 dark:to-blue-900"
        style={{
          height: 'calc(40px + env(safe-area-inset-top))',
          minHeight: '40px'
        }}
      />

      <div className="heroContainer bg-white dark:bg-[#1a1a1a]">
        {/* Title section */}
        <div className="titleContainer">
          <h1 className="welcomeText mb-1 dark:text-[#60A5FA]">Nonna Vittoria Apartments</h1>
          <div className="subTitleContainer dark:bg-[#064e3b]">
            <span className="receptionText dark:text-[#34d399]">Online Reception 24h</span>
          </div>
        </div>

        {/* Hero image */}
        <img
          src="https://www.assets.houfy.com/assets/images/weblistings/c15e54c09d867202f5c62c04a6768b2d.jpg"
          alt="Nonna Vittoria Apartments"
          className="heroImage"
        />

        {/* Action buttons */}
        <div className="buttonContainer">
          {heroItems.map((item, index) => (
            <button
              key={index}
              className="heroButton dark:bg-[#1e293b] dark:hover:bg-[#334155]"
              onClick={item.onClick}
            >
              <span className="heroIcon">{item.icon}</span>
              <span className="heroText dark:text-[#60A5FA]">{item.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Login Modal */}
      <GuestLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
        isLoading={isLoading}
        error={error}
        redirectToChat={false}
      />

      {/* Chat Drawer - opened via FloatingChatButton event */}
      <GuestChatDrawer
        isOpen={showChatDrawer}
        onClose={() => setShowChatDrawer(false)}
        token={token}
        guestName={guestName}
        onSessionExpired={handleSessionExpired}
      />
    </>
  );
};

export default HeroSection;
