import React from "react";
import HeroSection from "../components/HeroSection";
import SpecialOffers from "../components/SpecialOffers";
import ServicesSection from "../components/ServicesSection";
import FloatingChatButton from "../components/FloatingChatButton";

const Home: React.FC = () => {
  const handleChatButtonPress = () => {
    console.log("Chat button pressed!");
  };

  return (
    <div 
      className="absolute inset-0 overflow-y-auto overflow-x-hidden"
      style={{
        bottom: '88px',
        top: 0,
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        touchAction: 'pan-y',
      }}
    >
      <div className="flex flex-col w-full min-h-full pb-24">
        <HeroSection />
        <div className="mt-4">
          <SpecialOffers />
        </div>
        <div className="mt-4">
          <ServicesSection />
        </div>
        <FloatingChatButton onPress={handleChatButtonPress} />
      </div>
    </div>
  );
};

export default Home;