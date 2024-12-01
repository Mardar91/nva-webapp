import React, { useEffect } from "react";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";

const VipTicketHero = () => {
  useEffect(() => {
    // Aggiorna il colore della barra di stato
    const themeColor = document.querySelector('meta[name="theme-color"]');
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    if (themeColor) {
      themeColor.setAttribute('content', darkModeMediaQuery.matches ? '#1a1a1a' : '#1e3a8a');
    }

    // Ripristina il colore originale quando il componente viene smontato
    return () => {
      if (themeColor) {
        themeColor.setAttribute('content', darkModeMediaQuery.matches ? '#1a1a1a' : '#ffffff');
      }
    };
  }, []);

  const handleVipTicket = () => {
    // Rileva il sistema operativo
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && 
      !(window as any).MSStream;
    
    if (isIOS) {
      // Per dispositivi iOS, scarica il file .pkpass
      window.open(
        "https://nonnavittoriaapartments.it/VipTicket.pkpass",
        "_blank"
      );
    } else {
      // Per dispositivi Android, apri il link Google Pay Pass
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
