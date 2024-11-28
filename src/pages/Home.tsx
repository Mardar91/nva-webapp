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
      className="giftCardSection overflow-y-auto pb-24" 
      style={{
        height: 'calc(100vh - 88px)', // Altezza dello schermo meno l'altezza della navbar
        WebkitOverflowScrolling: 'touch', // Per scrolling fluido su iOS
        overscrollBehavior: 'none', // Previene lo scroll bounce
      }}
    >
      <main className="flex flex-col gap-y-8">
        <HeroSection />
        <SpecialOffers />
        <ServicesSection />
        <FloatingChatButton onPress={handleChatButtonPress} />
      </main>
    </div>
  );
};

export default Home;
