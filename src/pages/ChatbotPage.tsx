import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ChatbotPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Controlla se siamo in modalità standalone (PWA)
    const isInStandaloneMode = () =>
      (window.matchMedia('(display-mode: standalone)').matches) ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');

    if (isInStandaloneMode()) {
      // In modalità PWA, apri direttamente il link
      window.location.href = 'https://nva.zapier.app';
    } else {
      // In modalità browser, reindirizza alla home
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p>Caricamento chatbot...</p>
    </div>
  );
};

export default ChatbotPage;
