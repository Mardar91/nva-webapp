export const BOOKING_CONFIG = {
  // URL del channel manager per Book Now (embedded)
  IFRAME_URL: 'https://book.nonnavittoriaapartments.it/book',

  // URL del channel manager per Gift Cards (embedded)
  GIFT_CARD_IFRAME_URL: 'https://book.nonnavittoriaapartments.it/gift-cards',

  // Origini consentite per postMessage (stesse del check-in)
  ALLOWED_ORIGINS: [
    'https://book.nonnavittoriaapartments.it',
    'https://extranet.nonnavittoriaapartments.it',
    'http://localhost:3000',
    'http://localhost:3001'
  ],

  // Timeout per caricamento iframe (30 secondi)
  IFRAME_TIMEOUT: 30000,
};

// Verifica ESATTA dell'origine (solo match esatto per sicurezza)
export const isAllowedBookingOrigin = (origin: string): boolean => {
  return BOOKING_CONFIG.ALLOWED_ORIGINS.includes(origin);
};
