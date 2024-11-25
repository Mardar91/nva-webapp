import React, { useEffect, useState } from 'react';

const ChatbotPage: React.FC = () => {
  const [chatLoaded, setChatLoaded] = useState(false);

  useEffect(() => {
    // Previene il bounce effect su iOS
    document.body.style.overflow = 'hidden';

    // Funzione per caricare lo script del chatbot
    const loadChatbotScript = () => {
      // Verifica se lo script è già stato caricato
      if (document.getElementById('chatbot-script')) {
        setChatLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.id = 'chatbot-script';
      script.src = "https://nva.zapier.app";
      script.async = true;
      
      script.onload = () => {
        setChatLoaded(true);
        // Imposta flag per indicare che il chatbot è stato caricato
        localStorage.setItem('chatbotLoaded', 'true');
      };

      document.body.appendChild(script);
    };

    // Controlla se il chatbot era già caricato in precedenza
    if (localStorage.getItem('chatbotLoaded') === 'true') {
      loadChatbotScript();
    } else {
      loadChatbotScript();
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: '88px', // Altezza della barra di navigazione
      overflow: 'hidden',
      WebkitOverflowScrolling: 'touch',
    }}>
      {chatLoaded && (
        <div 
          id="chatbot-container"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
        >
          {/* Il chatbot verrà caricato qui */}
        </div>
      )}
    </div>
  );
};

export default ChatbotPage;
