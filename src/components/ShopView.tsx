import React from "react";
import { Navigate } from "react-router-dom";

const ShopView: React.FC = () => {
  React.useEffect(() => {
    window.location.href = "https://store.nonnavittoriaapartments.it";
  }, []);

  // Se per qualche motivo l'utente resta in questa view, redirect alla home
  return <Navigate to="/" replace />;
};

export default ShopView;
