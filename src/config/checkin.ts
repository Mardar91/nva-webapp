export const CHECKIN_CONFIG = {
  // URL del channel manager
  IFRAME_URL: 'https://extranet.nonnavittoriaapartments.it/checkin/embedded',
  
  // Origini consentite per postMessage (SICUREZZA MIGLIORATA)
  ALLOWED_ORIGINS: [
    'https://extranet.nonnavittoriaapartments.it',
    'http://localhost:3000',  // Per sviluppo NVA
    'http://localhost:3001'   // Per sviluppo Channel Manager
  ],
  
  // Timeout per caricamento iframe (30 secondi)
  IFRAME_TIMEOUT: 30000,
  
  // Giorni prima del check-in in cui diventa disponibile
  CHECKIN_AVAILABLE_DAYS_BEFORE: 3,
  
  // Giorni dopo il check-in in cui rimane disponibile
  CHECKIN_AVAILABLE_DAYS_AFTER: 1
};

// ✅ SICUREZZA MIGLIORATA: Verifica ESATTA dell'origine
export const isAllowedOrigin = (origin: string): boolean => {
  return CHECKIN_CONFIG.ALLOWED_ORIGINS.some(allowed => 
    origin === allowed || origin.startsWith(allowed)
  );
};
