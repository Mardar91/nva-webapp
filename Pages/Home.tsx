import React from "react";
import HeroSection from "../components/HeroSection";
import SpecialOffers from "../components/SpecialOffers";
import ServicesSection from "../components/ServicesSection";
import FloatingChatButton from "../components/FloatingChatButton";

const Home: React.FC = () => {
  return (
    <main className="flex flex-col gap-y-8">
      <HeroSection />
      <SpecialOffers />
      <ServicesSection />
      <FloatingChatButton />
    </main>
  );
};

export default Home;
