// ============================================
// APP: NVA (React App)
// FILE: src/components/HeroSection.tsx
// PURPOSE: Hero section with modern design
// ============================================

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, LogIn, Map, User, LogOut, ChevronDown, Sparkles } from "lucide-react";
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
      subtitle: "Reserve your stay",
      icon: <Calendar size={28} strokeWidth={1.5} />,
      onClick: () => navigate("/book"),
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "Check-in",
      subtitle: "Online process",
      icon: <LogIn size={28} strokeWidth={1.5} />,
      onClick: () => navigate("/check-in"),
      gradient: "from-emerald-500 to-emerald-600",
    },
    {
      title: "Explore",
      subtitle: "Discover the area",
      icon: <Map size={28} strokeWidth={1.5} />,
      onClick: () => navigate("/explore"),
      gradient: "from-violet-500 to-violet-600",
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
      {/* Modern Header with Gradient */}
      <div
        className="fixed top-0 left-0 right-0 z-50"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Logo/Brand */}
            <div className="flex items-center gap-2">
              <img
                src="/icons/logo-512x512.png"
                alt="NV Logo"
                className="w-8 h-8 rounded-xl object-cover"
              />
              <span className="text-white font-semibold text-sm">Nonna Vittoria</span>
            </div>

            {/* Login Button */}
            {isLoggedIn ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white pl-3 pr-2 py-2 rounded-xl text-sm font-medium transition-all duration-200 border border-white/20"
                >
                  <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <span className="truncate max-w-[80px]">
                    {guestName || 'Guest'}
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 rounded-2xl shadow-xl py-2 z-50 border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <LogOut className="h-4 w-4 text-gray-400" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleLoginClick}
                className="flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border border-white/20"
              >
                <User className="h-4 w-4" />
                Login
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div
        className="w-full"
        style={{
          height: 'calc(56px + env(safe-area-inset-top))',
          minHeight: '56px'
        }}
      />

      {/* Hero Content */}
      <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        {/* Welcome Section */}
        <div className="px-5 pt-6 pb-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Nonna Vittoria <span className="text-blue-600 dark:text-blue-400">Apartments</span>
            </h1>

            {/* Reception Badge - Modern Style */}
            <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 px-4 py-2 rounded-full border border-emerald-200 dark:border-emerald-800">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-700 dark:text-emerald-300 text-sm font-medium">
                Online Reception 24h
              </span>
            </div>
          </div>
        </div>

        {/* Hero Image with Overlay */}
        <div className="px-5 pb-5">
          <div className="relative rounded-3xl overflow-hidden shadow-xl">
            <img
              src="https://www.assets.houfy.com/assets/images/weblistings/c15e54c09d867202f5c62c04a6768b2d.jpg"
              alt="Nonna Vittoria Apartments"
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

            {/* Floating Badge on Image */}
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Mola di Bari, Puglia</span>
            </div>
          </div>
        </div>

        {/* Action Buttons - Modern Cards */}
        <div className="px-5 pb-6">
          <div className="grid grid-cols-3 gap-3">
            {heroItems.map((item, index) => (
              <button
                key={index}
                onClick={item.onClick}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden"
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-2 text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {item.icon}
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-white transition-colors duration-300">
                    {item.title}
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 group-hover:text-white/80 transition-colors duration-300 mt-0.5">
                    {item.subtitle}
                  </span>
                </div>
              </button>
            ))}
          </div>
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
