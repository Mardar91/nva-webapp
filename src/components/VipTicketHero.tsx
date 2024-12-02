import React, { useEffect } from "react";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";

const VipTicketHero = () => {
  useEffect(() => {
    // Aggiorna il colore della barra di stato
    const themeColor = document.querySelector('meta[name="theme-color"]');
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    if (themeColor) {
      // In modalità light, mantiene il blu mentre il componente è visibile
      themeColor.setAttribute('content', darkModeMediaQuery.matches ? '#1a1a1a' : '#1e3a8a');
    }

    // Listener per i cambiamenti del tema
    const handleColorSchemeChange = (e: MediaQueryListEvent) => {
      if (themeColor) {
        themeColor.setAttribute('content', e.matches ? '#1a1a1a' : '#1e3a8a');
      }
    };

    darkModeMediaQuery.addListener(handleColorSchemeChange);

    // Ripristina il colore originale quando il componente viene smontato
    return () => {
      if (themeColor) {
        themeColor.setAttribute('content', darkModeMediaQuery.matches ? '#1a1a1a' : '#ffffff');
      }
      darkModeMediaQuery.removeListener(handleColorSchemeChange);
    };
  }, []);

  const handleVipTicket = () => {
    // Rileva tutti i dispositivi Apple (iOS, iPadOS e macOS)
    const isAppleDevice = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent) && 
      !(window as any).MSStream;
    
    if (isAppleDevice) {
      // Per dispositivi Apple, scarica il file .pkpass
      window.open(
        "https://nonnavittoriaapartments.it/VipTicket.pkpass",
        "_blank"
      );
    } else {
      // Per tutti gli altri dispositivi (Android, Windows, etc), apri il link Google Pay Pass
      window.open(
        "https://app.passcreator.com/en/passinstance/googlepaypass?noBundling=0&passInstance[__identity]=20ad5572-9d1c-497c-b091-215c9874ce85",
        "_blank"
      );
    }
  };

  return (
    <div className="vipHeroContainer extended-blue-bg bg-[#1e3a8a] dark:bg-[#1a1a1a]">
      <h2 className="vipHeroTitle">Get Your Free VIP Ticket!</h2>
      <p className="vipHeroSubtitle">
        Download your digital VIP Ticket to enjoy exclusive 10% discounts at all
        our partner locations
      </p>
      <Button 
        className={cn(
          "vipButton", 
          "golden-vip-button"
        )} 
        onClick={handleVipTicket}
      >
        <span className="vipButtonIcon">🎟️</span>
        Download VIP Ticket
      </Button>
    </div>
  );
};

export default VipTicketHero;
