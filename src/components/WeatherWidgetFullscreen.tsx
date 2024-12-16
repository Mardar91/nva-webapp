import React, { useEffect } from 'react';
import { Cloud } from 'lucide-react';

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
      <style>{`
        @keyframes weather-pulse {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 0.8; }
        }

        .weather-title {
          animation: weather-pulse 3s ease-in-out infinite;
        }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
          100% { transform: translateY(0px); }
        }

        .floating-cloud {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
      
      {/* Titolo animato */}
      <div className="text-center py-6 flex items-center justify-center gap-3">
        <Cloud className="floating-cloud text-[#1e3a8a] dark:text-[#60A5FA]" size={28} />
        <h2 className="weather-title text-2xl font-bold text-[#1e3a8a] dark:text-[#60A5FA]">
          Weather in the surrounding area
        </h2>
        <Cloud className="floating-cloud text-[#1e3a8a] dark:text-[#60A5FA]" size={28} />
      </div>
      
      {/* Contenitore del widget con padding */}
      <div className="flex justify-center items-center pointer-events-none px-3">
        <div
          className="tomorrow"
          data-location-id="140209,058790,140296,137215,140213,135365"
          data-language="EN"
          data-unit-system="METRIC"
          data-skin="light"
          data-widget-type="aqi6"
          style={{ 
            width: '100%', 
            maxWidth: '800px',
            padding: '0 8px' // Padding interno al widget
          }}
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
