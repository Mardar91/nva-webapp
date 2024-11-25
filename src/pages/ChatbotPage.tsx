import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChatbotPage.css';

const ChatbotPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Previeni il bounce effect su iOS
    document.body.style.overflow = 'hidden';

    // Crea un contenitore per il chatbot
    const chatContainer = containerRef.current;
    if (!chatContainer) return;

    // Funzione per caricare il chatbot
    const loadChatbot = async () => {
      try {
        // Usa fetch per caricare il contenuto
        const response = await fetch('https://nva.zapier.app');
        if (response.ok) {
          // Imposta il contenuto nel container
          chatContainer.innerHTML = await response.text();
          
          // Trova tutti i link nel contenuto e gestiscili
          const links = chatContainer.getElementsByTagName('a');
          Array.from(links).forEach(link => {
            link.addEventListener('click', (e) => {
              e.preventDefault();
              window.location.href = link.href;
            });
          });

          setIsLoading(false);
        }
      } catch (error) {
        console.error('Errore nel caricamento del chatbot:', error);
        // In caso di errore, reindirizza direttamente
        window.location.href = 'https://nva.zapier.app';
      }
    };

    loadChatbot();

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="chatbot-container">
      {isLoading && (
        <div className="chatbot-loading">
          <div className="loading-spinner"></div>
          <p>Caricamento chatbot...</p>
        </div>
      )}
      <div 
        ref={containerRef}
        className="chatbot-content"
        style={{
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out'
        }}
      />
    </div>
  );
};

export default ChatbotPage;
