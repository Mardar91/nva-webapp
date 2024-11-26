import React from "react";

const ShopView: React.FC = () => {
  const openWebApp = () => {
    window.location.href = "https://store.nonnavittoriaapartments.it";
  };

  React.useEffect(() => {
    openWebApp();
  }, []);

  return null;
};

export default ShopView;
