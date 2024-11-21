import React, { useRef, useEffect, useCallback, useState } from "react";
import { FaRobot } from "react-icons/fa";
import { useSpring, animated } from "react-spring"; // Importiamo react-spring
import "./FloatingChatButton.css"; // Assicurati che il file CSS sia presente

const BUTTON_SIZE = 60;
const SWIPE_THRESHOLD = 50;

// Definiamo l'interfaccia per i props
interface FloatingChatButtonProps {
  onPress: () => void;  // Tipo di onPress come funzione che non restituisce nulla
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ onPress }) => {
  const [panX, setPanX] = useState(0);
  const [scale, setScale] = useState(1);
  const [opacity, setOpacity] = useState(1);
  const [waveAnimation, setWaveAnimation] = useState(0);

  const startWavingAnimation = useCallback(() => {
    setWaveAnimation((prev) => (prev === 0 ? 1 : 0));
  }, []);

  useEffect(() => {
    const interval = setInterval(startWavingAnimation, 5000); // Ripete l'animazione ogni 5 secondi
    return () => clearInterval(interval);
  }, [startWavingAnimation]);

  const handleSwipe = (e) => {
    const { clientX } = e.changedTouches[0];
    if (clientX < SWIPE_THRESHOLD) {
      setPanX(window.innerWidth);
      setOpacity(0.3);
      setScale(0.8);
    } else if (clientX > window.innerWidth - SWIPE_THRESHOLD) {
      setPanX(0);
      setOpacity(1);
      setScale(1);
    } else {
      setPanX(0);
    }
  };

  const openWebApp = () => {
    window.open("https://nva.zapier.app", "_blank"); // Apre la webapp in una nuova finestra
  };

  const springProps = useSpring({
    transform: `translateX(${panX}px) scale(${scale})`,
    opacity: opacity,
    config: { tension: 170, friction: 26 },
  });

  return (
    <animated.div
      className="floating-chat-button"
      style={springProps}
      onTouchMove={handleSwipe}
    >
      <button className="chat-button" onClick={openWebApp}>
        <animated.div
          style={{
            transform: waveAnimation === 0 ? "rotate(0deg)" : "rotate(-20deg)",
            transition: "transform 0.3s ease-in-out",
          }}
        >
          <FaRobot size={30} color="#ffffff" />
        </animated.div>
      </button>
    </animated.div>
  );
};

export default FloatingChatButton;
