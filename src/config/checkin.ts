export const CHECKIN_CONFIG = {
  // URL del channel manager (pagine pubbliche su book.nonnavittoriaapartments.it)
  IFRAME_URL: 'https://book.nonnavittoriaapartments.it/checkin/embedded',

  // Origini consentite per postMessage
  ALLOWED_ORIGINS: [
    'https://book.nonnavittoriaapartments.it',
    'https://extranet.nonnavittoriaapartments.it',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  
  // Timeout per caricamento iframe (30 secondi)
  IFRAME_TIMEOUT: 30000,
  
  // ✅ MODIFICATO: 7 giorni prima invece di 3
  CHECKIN_AVAILABLE_DAYS_BEFORE: 7,
  
  // Giorni dopo il check-in in cui rimane disponibile
  CHECKIN_AVAILABLE_DAYS_AFTER: 1
};

// Verifica ESATTA dell'origine (solo match esatto per sicurezza)
export const isAllowedOrigin = (origin: string): boolean => {
  return CHECKIN_CONFIG.ALLOWED_ORIGINS.includes(origin);
};
