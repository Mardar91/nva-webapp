import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ShopView: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Apre lo shop in una nuova finestra
    window.open("https://store.nonnavittoriaapartments.it", "_blank");
    // Torna alla home
    navigate("/");
  }, [navigate]);

  return null;
};

export default ShopView;
