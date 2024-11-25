import React from "react";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";

const VipTicketHero = () => {
  const handleVipTicket = () => {
    window.open(
      "https://nonnavittoriaapartments.it/VipTicket.pkpass",
      "_blank"
    );
  };

  return (
    <div className="vipHeroContainer extended-blue-bg">
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
