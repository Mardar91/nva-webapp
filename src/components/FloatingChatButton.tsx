// ============================================
// APP: NVA (React App)
// FILE: src/components/FloatingChatButton.tsx
// PURPOSE: Floating chat button - opens CM chat if logged in, chatbot if not
// ============================================

import React, { useRef, useEffect, useCallback, useState } from "react";
import { FaRobot, FaComments } from "react-icons/fa";
import { useSpring, animated } from "react-spring";
import { useTranslation } from "react-i18next";
import { useGuestSession } from "../hooks/useGuestSession";
import "./FloatingChatButton.css";

interface FloatingChatButtonProps {
  onPress?: () => void;
  unreadCount?: number;
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ onPress, unreadCount = 0 }) => {
  const { t } = useTranslation();
  const { isLoggedIn } = useGuestSession();
  const [panX, setPanX] = useState(0);
  const [scale, setScale] = useState(1);
  const [opacity, setOpacity] = useState(1);
  const [waveAnimation, setWaveAnimation] = useState(0);
  const [isIOS, setIsIOS] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showSecondPrompt, setShowSecondPrompt] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const promptTimerRef = useRef<NodeJS.Timeout>();
  const secondPromptTimerRef = useRef<NodeJS.Timeout>();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // First prompt after 1 second
    const showTimer = setTimeout(() => {
      setShowPrompt(true);

      // Hide first prompt after 4 seconds
      promptTimerRef.current = setTimeout(() => {
        setShowPrompt(false);
      }, 4000);
    }, 1000);

    // Second prompt after 4 minutes
    const secondShowTimer = setTimeout(() => {
      setShowSecondPrompt(true);

      // Hide second prompt after 4 seconds
      secondPromptTimerRef.current = setTimeout(() => {
        setShowSecondPrompt(false);
      }, 4000);
    }, 240000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(secondShowTimer);
      if (promptTimerRef.current) {
        clearTimeout(promptTimerRef.current);
      }
      if (secondPromptTimerRef.current) {
        clearTimeout(secondPromptTimerRef.current);
      }
    };
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

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

  const openChatbot = () => {
    window.open("https://nva.zapier.app", "_blank");
    setShowMenu(false);
  };

  const openGuestChat = () => {
    // Dispatch custom event to open the guest chat drawer in HeroSection
    window.dispatchEvent(new CustomEvent('openGuestChat'));
    setShowMenu(false);
  };

  const handleButtonClick = () => {
    if (isLoggedIn) {
      // If logged in, show menu with options
      setShowMenu(!showMenu);
    } else {
      // If not logged in, open chatbot directly
      openChatbot();
    }
    onPress?.();
  };

  const springProps = useSpring({
    transform: `translateX(${panX}px) scale(${scale})`,
    opacity: opacity,
    config: { tension: 170, friction: 26 },
  });

  const handleClosePrompt = (isSecond: boolean = false) => {
    if (isSecond) {
      setShowSecondPrompt(false);
      if (secondPromptTimerRef.current) {
        clearTimeout(secondPromptTimerRef.current);
      }
    } else {
      setShowPrompt(false);
      if (promptTimerRef.current) {
        clearTimeout(promptTimerRef.current);
      }
    }
  };

  return (
    <animated.div
      className={`floating-chat-button ${isIOS ? 'ios-device' : ''}`}
      style={{
        ...springProps,
        WebkitAppearance: 'none',
        transform: `${springProps.transform} translateZ(0)`,
      }}
      onTouchMove={handleSwipe}
      ref={menuRef}
    >
      {/* Prompts */}
      {showPrompt && !showMenu && (
        <div className="chat-prompt">
          <button
            className="chat-prompt-close"
            onClick={(e) => {
              e.stopPropagation();
              handleClosePrompt();
            }}
          >
            ×
          </button>
          {isLoggedIn ? t('floatingChat.needHelp') : t('floatingChat.greeting')}
        </div>
      )}
      {showSecondPrompt && !showPrompt && !showMenu && (
        <div className="chat-prompt">
          <button
            className="chat-prompt-close"
            onClick={(e) => {
              e.stopPropagation();
              handleClosePrompt(true);
            }}
          >
            ×
          </button>
          {t('floatingChat.hereForYou')}
        </div>
      )}

      {/* Menu for logged in users */}
      {showMenu && isLoggedIn && (
        <div className="chat-menu">
          <button
            className="chat-menu-item"
            onClick={openGuestChat}
          >
            <FaComments size={18} />
            <span>{t('floatingChat.chatWithUs')}</span>
            {unreadCount > 0 && (
              <span className="chat-menu-badge">{unreadCount}</span>
            )}
          </button>
          <button
            className="chat-menu-item"
            onClick={openChatbot}
          >
            <FaRobot size={18} />
            <span>{t('floatingChat.aiAssistant')}</span>
          </button>
        </div>
      )}

      {/* Main button */}
      <button
        className="chat-button"
        onClick={handleButtonClick}
        style={{
          WebkitAppearance: 'none',
          transform: 'translateZ(0)',
        }}
      >
        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="unread-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
        <animated.div
          style={{
            transform: waveAnimation === 0 ? "rotate(0deg)" : "rotate(-20deg)",
            transition: "transform 0.3s ease-in-out",
          }}
        >
          {isLoggedIn ? (
            <FaComments size={28} color="#ffffff" />
          ) : (
            <FaRobot size={30} color="#ffffff" />
          )}
        </animated.div>
      </button>
    </animated.div>
  );
};

export default FloatingChatButton;
