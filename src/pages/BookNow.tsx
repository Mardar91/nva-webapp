import React from "react";

const BookNow = () => {
  return (
    <div className="flex-grow h-full">
      <iframe
        src="https://nonnavittoriaapartments.houfy.com/"
        className="w-full h-full"
        title="Book Now"
        style={{
          height: "calc(100vh - 88px)",
          marginBottom: "88px",
          border: "none",
          display: "block"
        }}
      />
    </div>
  );
};

export default BookNow;
