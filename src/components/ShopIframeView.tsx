import React from "react";

const ShopIframeView: React.FC = () => {
  return (
    <div className="flex-grow h-full">
      <iframe
        src="https://store.nonnavittoriaapartments.it"
        className="w-full h-full"
        style={{
          height: "calc(100vh - 88px)",
          marginBottom: "88px",
          border: "none",
          display: "block"
        }}
        allow="fullscreen *; clipboard-write; clipboard-read"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
      />
    </div>
  );
};

export default ShopIframeView;
