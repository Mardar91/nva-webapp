// ============================================
// APP: NVA (React App)
// FILE: src/pages/Home.tsx
// PURPOSE: Home page with hero section and floating chat button
// ============================================

import React from "react";
import HeroSection from "../components/HeroSection";
import SpecialOffers from "../components/SpecialOffers";
import ServicesSection from "../components/ServicesSection";
import FloatingChatButton from "../components/FloatingChatButton";
import { useGuestSession } from "../hooks/useGuestSession";
import { useUnreadMessages } from "../hooks/useUnreadMessages";

const Home: React.FC = () => {
  const { isLoggedIn, token } = useGuestSession();
  const { unreadCount } = useUnreadMessages(token, isLoggedIn);

  const handleChatButtonPress = () => {
    console.log("Chat button pressed!");
  };

  return (
    <div
      className="absolute inset-0 overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-gray-900"
      style={{
        bottom: '88px',
        top: 0,
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        touchAction: 'pan-y',
      }}
    >
      <div className="flex flex-col w-full min-h-full pb-8">
        <HeroSection />
        <div className="mt-2">
          <SpecialOffers />
        </div>
        <div className="mt-2">
          <ServicesSection />
        </div>
        <FloatingChatButton
          onPress={handleChatButtonPress}
          unreadCount={unreadCount}
        />
      </div>
    </div>
  );
};

export default Home;
