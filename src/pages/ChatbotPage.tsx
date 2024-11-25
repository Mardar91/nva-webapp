import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ChatbotPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Apri il chatbot in una nuova finestra
    const chatbotWindow = window.open('https://nva.zapier.app', '_blank', 'noopener,noreferrer');
    
    // Gestisci il caso in cui il popup viene bloccato
    if (!chatbotWindow) {
      alert('Per favore, abilita i popup per aprire il chatbot');
      navigate('/'); // Torna alla home se il popup è bloccato
      return;
    }

    // Usa localStorage per tracciare lo stato del chatbot
    localStorage.setItem('chatbot_opened', 'true');

    // Aggiungi un listener per quando la finestra viene chiusa
    const checkClosed = setInterval(() => {
      if (chatbotWindow.closed) {
        localStorage.removeItem('chatbot_opened');
        clearInterval(checkClosed);
        navigate('/'); // Torna alla home quando il chatbot viene chiuso
      }
    }, 500);

    // Pulisci l'intervallo quando il componente viene smontato
    return () => {
      clearInterval(checkClosed);
    };
  }, [navigate]);

  return (
    <div>
      <p>Aprendo il chatbot...</p>
    </div>
  );
};

export default ChatbotPage;
