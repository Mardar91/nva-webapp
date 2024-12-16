import React, { useEffect } from "react";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";

const VipTicketHero = () => {
  useEffect(() => {
    const themeColor = document.querySelector('meta[name="theme-color"]');
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    if (themeColor) {
      themeColor.setAttribute('content', darkModeMediaQuery.matches ? '#1a1a1a' : '#1e3a8a');
    }

    const handleColorSchemeChange = (e: MediaQueryListEvent) => {
      if (themeColor) {
        themeColor.setAttribute('content', e.matches ? '#1a1a1a' : '#1e3a8a');
      }
    };

    darkModeMediaQuery.addListener(handleColorSchemeChange);

    return () => {
      if (themeColor) {
        themeColor.setAttribute('content', darkModeMediaQuery.matches ? '#1a1a1a' : '#ffffff');
      }
      darkModeMediaQuery.removeListener(handleColorSchemeChange);
    };
  }, []);

  const handleVipTicket = () => {
    // Rileva iOS/iPadOS in modo più accurato
    const isAppleDevice = /iPhone|iPad|iPod/.test(navigator.userAgent) && 'maxTouchPoints' in navigator && 
      (navigator.maxTouchPoints > 0);
    
    // Rileva macOS (escludendo iPad)
    const isMacOS = /Macintosh/.test(navigator.userAgent) && 
      (!('maxTouchPoints' in navigator) || navigator.maxTouchPoints === 0);

    if (isAppleDevice || isMacOS) {
      // Per dispositivi Apple, usa il .pkpass
      if (isAppleDevice) {
        // Forza l'apertura in Safari per iOS/iPadOS
        window.location.href = "https://nonnavittoriaapartments.it/VipTicket.pkpass";
      } else {
        // Per macOS, apri in una nuova finestra
        window.open(
          "https://nonnavittoriaapartments.it/VipTicket.pkpass",
          "_blank"
        );
      }
    } else {
      // Per Android e altri dispositivi
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
