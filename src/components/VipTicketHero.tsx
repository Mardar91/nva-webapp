import React, { useEffect, useState } from "react";
import { Ticket, Sparkles, Gift, Lock } from "lucide-react";
import { useGuestSession } from "../hooks/useGuestSession";

const VipTicketHero = () => {
  const { isLoggedIn } = useGuestSession();
  const [showToast, setShowToast] = useState(false);
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
    // Check if user is logged in
    if (!isLoggedIn) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

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
    <div className="relative overflow-hidden">
      {/* Toast notification */}
      {showToast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-lg">
            <Lock className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-medium">Log in to download your VIP Ticket</span>
          </div>
        </div>
      )}

      {/* Background with gradient */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 dark:from-gray-800 dark:via-gray-900 dark:to-gray-900">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative px-5 py-8">
          {/* Icon badge */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg">
              <Ticket className="h-8 w-8 text-white" strokeWidth={1.5} />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white text-center mb-2">
            Get Your Free VIP Ticket!
          </h2>

          {/* Subtitle */}
          <p className="text-blue-100 dark:text-gray-300 text-center text-sm mb-6 max-w-xs mx-auto">
            Download your digital VIP Ticket to enjoy exclusive 10% discounts at all our partner locations
          </p>

          {/* Features */}
          <div className="flex justify-center gap-4 mb-6">
            <div className="flex items-center gap-1.5 text-white/80 text-xs">
              <Gift className="h-4 w-4 text-amber-400" />
              <span>10% OFF</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/80 text-xs">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>All Partners</span>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleVipTicket}
            className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-gray-900 font-bold py-4 px-6 rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
          >
            <Ticket className="h-5 w-5" />
            Download VIP Ticket
          </button>
        </div>
      </div>
    </div>
  );
};

export default VipTicketHero;
