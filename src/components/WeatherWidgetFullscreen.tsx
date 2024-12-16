import React, { useEffect } from 'react';

declare global {
  interface Window {
    __TOMORROW__?: {
      renderWidget: () => void;
    };
  }
}

const WeatherWidgetFullscreen: React.FC = () => {
  useEffect(() => {
    const loadScript = () => {
      const script = document.createElement('script');
      script.src = 'https://www.tomorrow.io/v1/widget/sdk/sdk.bundle.min.js';
      script.id = 'tomorrow-sdk';
      script.async = true;
      script.onload = () => {
        if (window.__TOMORROW__) {
          window.__TOMORROW__.renderWidget();
        }

        // Previeni il click sul widget dopo che è stato caricato
        const widgetElement = document.querySelector('.tomorrow');
        if (widgetElement) {
          const links = widgetElement.getElementsByTagName('a');
          Array.from(links).forEach(link => {
            link.addEventListener('click', (e) => e.preventDefault());
            link.style.pointerEvents = 'none';
          });
        }
      };
      document.body.appendChild(script);
    };

    if (!document.getElementById('tomorrow-sdk')) {
      loadScript();
    } else if (window.__TOMORROW__) {
      window.__TOMORROW__.renderWidget();
    }

    return () => {
      const script = document.getElementById('tomorrow-sdk');
      if (script) {
        script.remove();
      }
    };
  }, []);

  return (
    <div className="w-full h-full">
      {/* Titolo */}
      <h2 className="text-2xl font-bold text-[#1e3a8a] dark:text-[#60A5FA] text-center py-6">
        Weather in the surrounding area
      </h2>
      
      {/* Contenitore del widget con pointer-events-none */}
      <div className="flex justify-center items-center pointer-events-none">
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
            href="#"
            onClick={(e) => e.preventDefault()}
            style={{ 
              position: 'absolute', 
              bottom: 0, 
              transform: 'translateX(-50%)', 
              left: '50%',
              pointerEvents: 'none'
            }}
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
    </div>
  );
};

export default WeatherWidgetFullscreen;
