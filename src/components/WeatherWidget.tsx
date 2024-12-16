import React, { useEffect } from 'react';

declare global {
  interface Window {
    __TOMORROW__?: {
      renderWidget: () => void;
    };
  }
}

const WeatherWidget: React.FC = () => {
  useEffect(() => {
    // Funzione per caricare lo script
    const loadScript = () => {
      const script = document.createElement('script');
      script.src = 'https://www.tomorrow.io/v1/widget/sdk/sdk.bundle.min.js';
      script.id = 'tomorrow-sdk';
      script.async = true;
      script.onload = () => {
        if (window.__TOMORROW__) {
          window.__TOMORROW__.renderWidget();
        }
      };
      document.body.appendChild(script);
    };

    // Carica lo script solo se non esiste già
    if (!document.getElementById('tomorrow-sdk')) {
      loadScript();
    } else if (window.__TOMORROW__) {
      window.__TOMORROW__.renderWidget();
    }

    // Cleanup
    return () => {
      const script = document.getElementById('tomorrow-sdk');
      if (script) {
        script.remove();
      }
    };
  }, []);

  return (
    <div className="w-full h-full flex justify-center items-center">
      <div
        className="tomorrow"
        data-location-id="140209,058790,140296,137215,140213,135365"
        data-language="EN"
        data-unit-system="METRIC"
        data-skin="light"
        data-widget-type="aqi6"
        style={{ width: '100%', maxWidth: '800px' }}
      >
        <a
          href="https://www.tomorrow.io/weather-api/"
          rel="nofollow noopener noreferrer"
          target="_blank"
          style={{ position: 'absolute', bottom: 0, transform: 'translateX(-50%)', left: '50%' }}
        >
          <img
            alt="Powered by the Tomorrow.io Weather API"
            src="https://weather-website-client.tomorrow.io/img/powered-by.svg"
            width="250"
            height="18"
          />
        </a>
      </div>
    </div>
  );
};

export default WeatherWidget;
