import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

// Definizione dei colori per tema e route
const STATUS_BAR_COLORS = {
  light: {
    default: '#1e3a8a', // Colore blu di default
    home: '#ffffff',    // Bianco per la home in tema chiaro
    iframe: '#ffffff'   // Bianco per le pagine con iframe
  },
  dark: {
    default: '#1e3a8a', // Colore blu di default
    home: '#1a1a1a',    // Nero per la home in tema scuro
    iframe: '#1a1a1a'   // Nero per le pagine con iframe
  }
};

export const useStatusBarColor = () => {
  const location = useLocation();
  
  const updateStatusBarColor = useCallback(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const themeColor = document.querySelector('meta[name="theme-color"]');
    const currentTheme = darkModeMediaQuery.matches ? 'dark' : 'light';
    
    // Determina il colore in base alla route corrente
    let color = STATUS_BAR_COLORS[currentTheme].default;
    
    if (location.pathname === '/') {
      color = STATUS_BAR_COLORS[currentTheme].home;
    } else if (['/taxi', '/shop', '/gift-card'].includes(location.pathname)) {
      color = STATUS_BAR_COLORS[currentTheme].iframe;
    }
    
    if (themeColor) {
      themeColor.setAttribute('content', color);
    }
  }, [location.pathname]);

  useEffect(() => {
    // Aggiorna il colore iniziale
    updateStatusBarColor();

    // Ascolta i cambiamenti del tema
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = () => updateStatusBarColor();
    
    darkModeMediaQuery.addListener(handleThemeChange);

    // Cleanup
    return () => {
      darkModeMediaQuery.removeListener(handleThemeChange);
    };
  }, [updateStatusBarColor]);

  // Funzione per impostare manualmente il colore (utile per override temporanei)
  const setStatusBarColor = useCallback((color: string) => {
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.setAttribute('content', color);
    }
  }, []);

  return { setStatusBarColor, updateStatusBarColor };
};
