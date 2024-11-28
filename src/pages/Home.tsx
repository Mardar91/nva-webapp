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
      className="overflow-y-auto pb-24 w-full" 
      style={{
        height: 'calc(100vh - 88px)',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'none',
      }}
    >
      <main className="flex flex-col gap-y-8 w-full">
        <HeroSection />
        <SpecialOffers />
        <ServicesSection />
        <FloatingChatButton onPress={handleChatButtonPress} />
      </main>
    </div>
  );
};

export default Home;
