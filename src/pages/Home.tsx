import React from "react";
import HeroSection from "../components/HeroSection";
import SpecialOffers from "../components/SpecialOffers";
import ServicesSection from "../components/ServicesSection";
import FloatingChatButton from "../components/FloatingChatButton";

const Home: React.FC = () => {
  // Aggiungi una funzione di gestione per il bottone
  const handleChatButtonPress = () => {
    console.log("Chat button pressed!");
  };

  return (
    <main className="flex flex-col gap-y-8">
      <HeroSection />
      <SpecialOffers />
      <ServicesSection />
      {/* Passa la funzione di gestione al FloatingChatButton */}
      <FloatingChatButton onPress={handleChatButtonPress} />
    </main>
  );
};

export default Home;
