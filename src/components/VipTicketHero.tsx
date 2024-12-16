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
    // Verifica se è un dispositivo iOS/iPadOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && 
      !(window as any).MSStream && 
      !(('standalone' in window.navigator) && (window.navigator as any).standalone);
    
    // Verifica se è un Mac (escludendo iPad che si identifica come Mac)
    const isMacOS = /Macintosh/.test(navigator.userAgent) && 
      'ontouchend' in document === false;

    // Se è un dispositivo iOS non in modalità standalone, apri in Safari
    if (isIOSDevice) {
      window.location.href = "https://nonnavittoriaapartments.it/VipTicket.pkpass";
    } 
    // Se è macOS, apri in una nuova finestra
    else if (isMacOS) {
      window.open(
        "https://nonnavittoriaapartments.it/VipTicket.pkpass",
        "_blank"
      );
    } 
    // Per Android e altri dispositivi, usa il link Google Pay Pass
    else {
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
