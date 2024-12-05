import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import RomanticWeekModal from "./RomanticWeekModal";

const SpecialOffers = () => {
  const navigate = useNavigate();
  const [isRomanticWeekOpen, setIsRomanticWeekOpen] = useState(false);

  return (
    <div className="px-4">
      <h2 className="sectionTitle">Special Offers</h2>
      {/* Prima Card: Gift Card */}
      <div
        className="card"
        onClick={() => navigate("/gift-card")}
        style={{ cursor: "pointer" }}
      >
        <div className="cardHeader">
          <h3 className="cardTitle">GIFT CARD</h3>
          <div className="discountBadge glowing">
            <span className="discountText">+10% FREE</span>
          </div>
        </div>
        <p className="cardText">
          Get an extra 10% bonus on gift card purchases for future stays and
          services
        </p>
      </div>
      {/* Seconda Card: Romantic Week */}
      <div 
        className="card"
        onClick={() => setIsRomanticWeekOpen(true)}
        style={{ cursor: "pointer" }}
      >
        <div className="cardHeader">
          <h3 className="cardTitle">ROMANTIC WEEK</h3>
          <div className="discountBadge">
            <span className="discountText">SPECIAL PRICE</span>
          </div>
        </div>
        <p className="cardText">
          2 people, 6 nights, 1 welcome bottle of wine, only €380 (offer not
          valid during high season).
        </p>
      </div>

      <RomanticWeekModal 
        isOpen={isRomanticWeekOpen}
        onClose={() => setIsRomanticWeekOpen(false)}
      />
    </div>
  );
};

export default SpecialOffers;
