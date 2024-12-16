import React, { useRef, useEffect, useCallback, useState } from "react";
import { FaRobot } from "react-icons/fa";
import { useSpring, animated } from "react-spring";
import "./FloatingChatButton.css";

interface FloatingChatButtonProps {
  onPress: () => void;
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ onPress }) => {
  const [panX, setPanX] = useState(0);
  const [scale, setScale] = useState(1);
  const [opacity, setOpacity] = useState(1);
  const [waveAnimation, setWaveAnimation] = useState(0);
  const [isIOS, setIsIOS] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);
    
    // Mostra il prompt dopo un breve ritardo
    const promptTimer = setTimeout(() => {
      setShowPrompt(true);
    }, 1000);

    // Nascondi il prompt automaticamente dopo 5 secondi
    const hideTimer = setTimeout(() => {
      if (showPrompt) {
        setShowPrompt(false);
      }
    }, 6000);

    return () => {
      clearTimeout(promptTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  const startWavingAnimation = useCallback(() => {
    setWaveAnimation((prev) => (prev === 0 ? 1 : 0));
  }, []);

  useEffect(() => {
    const interval = setInterval(startWavingAnimation, 5000);
    return () => clearInterval(interval);
  }, [startWavingAnimation]);

  const handleSwipe = (e: React.TouchEvent<HTMLDivElement>) => {
    const { clientX } = e.changedTouches[0];
    if (clientX < 50) {
      setPanX(window.innerWidth);
      setOpacity(0.3);
      setScale(0.8);
    } else if (clientX > window.innerWidth - 50) {
      setPanX(0);
      setOpacity(1);
      setScale(1);
    } else {
      setPanX(0);
    }
  };

  const openWebApp = () => {
    window.open("https://nva.zapier.app", "_blank");
  };

  const springProps = useSpring({
    transform: `translateX(${panX}px) scale(${scale})`,
    opacity: opacity,
    config: { tension: 170, friction: 26 },
  });

  return (
    <animated.div
      className={`floating-chat-button ${isIOS ? 'ios-device' : ''}`}
      style={{
        ...springProps,
        WebkitAppearance: 'none',
        transform: `${springProps.transform} translateZ(0)`,
      }}
      onTouchMove={handleSwipe}
    >
      {showPrompt && (
        <div className="chat-prompt">
          <button
            className="chat-prompt-close"
            onClick={(e) => {
              e.stopPropagation();
              setShowPrompt(false);
            }}
          >
            ×
          </button>
          Hi, I'm here to help. Ask me anything!
        </div>
      )}
      <button 
        className="chat-button"
        onClick={openWebApp}
        style={{
          WebkitAppearance: 'none',
          transform: 'translateZ(0)',
        }}
      >
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
