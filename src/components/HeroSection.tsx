import React from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, LogIn, Map } from "lucide-react";

const HeroSection = () => {
  const navigate = useNavigate();

  const heroItems = [
    {
      title: "Book Now",
      icon: <Calendar size={32} color="#1e3a8a" />,
      onClick: () => navigate("/book"),
    },
    {
      title: "Check-in",
      icon: <LogIn size={32} color="#1e3a8a" />,
      onClick: () => navigate("/check-in"),
    },
    {
      title: "Explore",
      icon: <Map size={32} color="#1e3a8a" />,
      onClick: () => navigate("/explore"),
    },
  ];

  return (
    <div className="heroContainer">
      <h1 className="welcomeText">Nonna Vittoria Apartments</h1>
      <img
        src="https://www.assets.houfy.com/assets/images/weblistings/c15e54c09d867202f5c62c04a6768b2d.jpg"
        alt="Nonna Vittoria Apartments"
        className="heroImage"
      />
      <div className="buttonContainer">
        {heroItems.map((item, index) => (
          <button key={index} className="heroButton" onClick={item.onClick}>
            <span className="heroIcon">{item.icon}</span>
            <span className="heroText">{item.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default HeroSection;
