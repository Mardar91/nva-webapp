// ============================================
// 📱 APP: NVA (React App)
// 📄 FILE: src/components/HeroSection.tsx
// 🔧 PURPOSE: Hero section with login/chat bar
// ============================================

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, LogIn, Map, MessageCircle, User, LogOut } from "lucide-react";
import { useGuestSession } from "../hooks/useGuestSession";
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

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [loginForChat, setLoginForChat] = useState(false);

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
    setLoginForChat(false);
    setShowLoginModal(true);
  };

  const handleChatClick = () => {
    if (isLoggedIn) {
      setShowChatDrawer(true);
    } else {
      setLoginForChat(true);
      setShowLoginModal(true);
    }
  };

  const handleLogin = async (bookingRef: string, email: string): Promise<boolean> => {
    const success = await login(bookingRef, email);
    if (success && loginForChat) {
      // Open chat after successful login
      setTimeout(() => {
        setShowChatDrawer(true);
      }, 300);
    }
    return success;
  };

  const handleLogout = () => {
    logout();
    setShowChatDrawer(false);
  };

  const handleSessionExpired = () => {
    logout();
    setShowChatDrawer(false);
    setLoginForChat(true);
    setShowLoginModal(true);
  };

  return (
    <>
      <div className="heroContainer bg-white dark:bg-[#1a1a1a]">
        {/* Login/Chat Bar */}
        <div className="w-full bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 px-4 py-2">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {isLoggedIn ? (
              <>
                {/* Logged in state */}
                <div className="flex items-center gap-2 text-white">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium truncate max-w-[100px]">
                    {guestName || 'Guest'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleChatClick}
                    className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Chat
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white/90 px-3 py-1.5 rounded-full text-sm transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Not logged in state */}
                <button
                  onClick={handleLoginClick}
                  className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                >
                  <User className="h-4 w-4" />
                  Login
                </button>
                <button
                  onClick={handleChatClick}
                  className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat
                </button>
              </>
            )}
          </div>
        </div>

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
        redirectToChat={loginForChat}
      />

      {/* Chat Drawer */}
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
