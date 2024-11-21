import React from "react";
import { Button } from "../components/ui/button"; // Assicurati che il percorso sia corretto
import { cn } from "../lib/utils"; // Importa la funzione `cn` per la gestione delle classi

const VipTicketHero = () => {
  const handleVipTicket = () => {
    // Apri il link del ticket VIP
    window.open(
      "https://nonnavittoriaapartments.it/VipTicket.pkpass",
      "_blank"
    );
  };

  return (
    <div className="vipHeroContainer">
      <h2 className="vipHeroTitle">Get Your Free VIP Ticket!</h2>
      <p className="vipHeroSubtitle">
        Download your digital VIP Ticket to enjoy exclusive 10% discounts at all
        our partner locations
      </p>
      <Button className="vipButton" onClick={handleVipTicket}>
        <span className="vipButtonIcon">🎟️</span>
        Download VIP Ticket
      </Button>
    </div>
  );
};

export default VipTicketHero;
