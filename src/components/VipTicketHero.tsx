import React, { useEffect } from "react";
import { Button } from "../components/ui/button"; 
import { cn } from "../lib/utils";

const VipTicketHero = () => {
  useEffect(() => {
    // Imposta il colore del tema per la status bar
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', '#1e3a8a');
    }
    // Ripristina il colore originale quando il componente viene smontato
    return () => {
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', '#ffffff');
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
    <div className="vipHeroContainer extended-blue-bg bg-[#1e3a8a] dark:bg-[#1a1a1a]"> {/* Aggiunto dark:bg-[#1a1a1a] */}
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
