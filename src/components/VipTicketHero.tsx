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
    <div className="bg-blue-950 text-white min-h-screen flex flex-col justify-center items-center">
      <div className="text-center p-6">
        <h2 className="text-3xl font-bold mb-4">Get Your Free VIP Ticket!</h2>
        
        <p className="mb-6 text-lg">
          Download your digital VIP Ticket to enjoy exclusive 10% discounts at all our partner locations
        </p>
        
        <button 
          onClick={handleVipTicket}
          className="bg-yellow-500 text-black px-6 py-3 rounded-full flex items-center justify-center mx-auto space-x-2 hover:bg-yellow-600 transition-colors"
        >
          <span className="text-2xl">🎟️</span>
          <span>Download VIP Ticket</span>
        </button>
      </div>
    </div>
  );
};

export default VipTicketHero;
