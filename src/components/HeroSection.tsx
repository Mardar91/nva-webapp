import React from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, LogIn, Map } from "lucide-react";

const HeroSection = () => {
  const navigate = useNavigate();
  
  const heroItems = [
    {
      title: "Book Now",
      icon: <Calendar size={32} color="#60A5FA" />, // Cambiato il colore per la dark mode
      onClick: () => navigate("/book"),
    },
    {
      title: "Check-in",
      icon: <LogIn size={32} color="#60A5FA" />, // Cambiato il colore per la dark mode
      onClick: () => navigate("/check-in"),
    },
    {
      title: "Explore",
      icon: <Map size={32} color="#60A5FA" />, // Cambiato il colore per la dark mode
      onClick: () => navigate("/explore"),
    },
  ];

  return (
    <div className="heroContainer bg-white dark:bg-[#1a1a1a]"> {/* Aggiunto dark:bg-[#1a1a1a] */}
      <div className="titleContainer">
        <h1 className="welcomeText mb-1 dark:text-[#60A5FA]">Nonna Vittoria Apartments</h1>
        <div className="subTitleContainer dark:bg-[#064e3b]"> {/* Aggiunto dark:bg-[#064e3b] */}
          <span className="receptionText dark:text-[#34d399]">Online Reception 24h</span>
        </div>
      </div>
      <img
        src="https://www.assets.houfy.com/assets/images/weblistings/c15e54c09d867202f5c62c04a6768b2d.jpg"
        alt="Nonna Vittoria Apartments"
        className="heroImage"
      />
      <div className="buttonContainer">
        {heroItems.map((item, index) => (
          <button 
            key={index} 
            className="heroButton dark:bg-[#1e293b] dark:hover:bg-[#334155]" // Aggiunto stile dark mode
            onClick={item.onClick}
          >
            <span className="heroIcon">{item.icon}</span>
            <span className="heroText dark:text-[#60A5FA]">{item.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default HeroSection;
