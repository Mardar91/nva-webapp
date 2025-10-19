import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../components/ui/card";
import {
  Calendar as CalendarIcon,
  LogIn,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Clock,
  Home
} from "lucide-react";
import { useCheckInState } from '../hooks/useCheckInState';
import { useNotifications } from '../hooks/useNotifications';
import { scheduleCheckInReminder } from '../lib/checkInReminders';
import { CHECKIN_CONFIG, isAllowedOrigin } from '../config/checkin';

const CheckIn = () => {
  const {
    checkInState,
    updateCheckInState,
    resetCheckInState,
    isCheckInAvailable,
    daysUntilCheckIn
  } = useCheckInState();

  const { deviceId, isSubscribed } = useNotifications();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const [showIframe, setShowIframe] = useState(false);
  const [iframeUrl, setIframeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [iframeReady, setIframeReady] = useState(false);

  // ✅ Timeout per caricamento iframe con cleanup migliorato
  useEffect(() => {
    if (!showIframe || iframeReady || loadError) return;

    const timeout = setTimeout(() => {
      if (!iframeReady && !loadError) {
        console.error('⏱️ Timeout caricamento iframe');
        setLoadError(true);
        setIsLoading(false);
      }
    }, CHECKIN_CONFIG.IFRAME_TIMEOUT);

    return () => clearTimeout(timeout);
  }, [showIframe, iframeReady, loadError]);

  // ✅ Sincronizza stato loading con checkInState
  useEffect(() => {
    if (isLoading) {
      updateCheckInState({ status: 'loading' });
    }
  }, [isLoading, updateCheckInState]);

  // ✅ Nascondi chat button quando iframe è aperto
  useEffect(() => {
    const chatButton = document.querySelector('.floating-chat-button') as HTMLElement;
    if (chatButton) {
      chatButton.style.display = showIframe ? 'none' : 'flex';
    }
    return () => {
      if (chatButton) {
        chatButton.style.display = 'flex';
      }
    };
  }, [showIframe]);

  // ✅ Gestione messaggi dall'iframe con sicurezza migliorata
  const handleMessage = useCallback(async (event: MessageEvent) => {
    // Verifica origine per sicurezza
    if (!isAllowedOrigin(event.origin)) {
      console.warn('⚠️ Messaggio da origine non consentita:', event.origin);
      return;
    }

    const { type, data } = event.data;
    console.log('📨 Messaggio ricevuto:', type, data);

    switch (type) {
      case 'CHECKIN_IFRAME_READY':
        console.log('✅ Iframe pronto');
        setIframeReady(true);
        setIsLoading(false);
        setLoadError(false);
        break;

      case 'CHECKIN_VALIDATION_READY':
        console.log('✅ Validazione pronta');
        setIsLoading(false);
        break;

      case 'CHECKIN_VALIDATED':
        console.log('✅ Check-in validato:', data);
        
        // Aggiorna stato locale
        updateCheckInState({
          status: 'validated',
          bookingId: data.bookingId,
          apartmentName: data.apartmentName,
          checkInDate: data.checkInDate,
          checkOutDate: data.checkOutDate,
          numberOfGuests: data.numberOfGuests,
          mode: data.mode
        });

        // ✅ Gestione notifica con controllo deviceId
        if (data.checkInDate && deviceId) {
          const result = await scheduleCheckInReminder({
            checkInDate: data.checkInDate,
            deviceId: deviceId,
            bookingReference: data.bookingId
          });
          
          if (result.scheduled) {
            updateCheckInState({ 
              notificationScheduled: true,
              notificationSent: result.sentImmediately || false
            });
          }
        } else if (data.checkInDate && !deviceId) {
          console.warn('⚠️ Impossibile programmare notifica: deviceId mancante');
        }
        break;

      case 'CHECKIN_FORM_READY':
        console.log('✅ Form check-in pronto');
        updateCheckInState({ status: 'form_ready' });
        break;

      case 'CHECKIN_FORM_SUBMITTED':
        console.log('✅ Form inviato:', data);
        break;

      case 'CHECKIN_COMPLETED':
        console.log('🎉 Check-in completato!', data);
        
        updateCheckInState({
          status: 'completed',
          completedAt: data.timestamp
        });
        
        // Chiudi iframe dopo 2 secondi
        setTimeout(() => {
          setShowIframe(false);
        }, 2000);
        break;

      case 'CHECKIN_CLOSE_REQUESTED':
        console.log('🚪 Richiesta chiusura iframe');
        setShowIframe(false);
        break;
    }
  }, [deviceId, updateCheckInState]);

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  // Funzione per avviare check-in
  const handleStartCheckIn = () => {
    setIsLoading(true);
    setLoadError(false);
    setIframeReady(false);
    
    // Costruisci URL con parametri
    const params = new URLSearchParams();
    
    if (checkInState.savedEmail) {
      params.set('email', checkInState.savedEmail);
    }
    if (checkInState.savedBookingRef) {
      params.set('bookingRef', checkInState.savedBookingRef);
    }
    
    const url = `${CHECKIN_CONFIG.IFRAME_URL}?${params.toString()}`;
    console.log('🚀 Apertura iframe:', url);
    
    setIframeUrl(url);
    setShowIframe(true);
  };

  // ✅ Funzione per ricaricare iframe MIGLIORATA
  const handleReloadIframe = () => {
    setLoadError(false);
    setIframeReady(false);
    setIsLoading(true);
    
    // ✅ Forza unmount/remount per reload completo
    setShowIframe(false);
    setTimeout(() => {
      setShowIframe(true);
    }, 100);
  };

  // Funzione per nuovo check-in
  const handleNewCheckIn = () => {
    resetCheckInState();
    handleStartCheckIn();
  };

  // Funzione per chiudere iframe
  const handleCloseIframe = () => {
    setShowIframe(false);
    setIsLoading(false);
    setLoadError(false);
    setIframeReady(false);
  };

  // ========== RENDERING IFRAME ==========
  if (showIframe) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-[#1a1a1a]">
        {/* Loading Overlay */}
        {isLoading && !loadError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 dark:bg-[#1a1a1a]/95 z-10">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
            <p className="text-gray-700 dark:text-gray-300 font-medium">Caricamento check-in...</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Attendere prego</p>
          </div>
        )}

        {/* Error Overlay */}
        {loadError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-[#1a1a1a] z-10 p-6">
            <XCircle className="h-16 w-16 text-red-500 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Errore di Caricamento
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              Non è stato possibile caricare la pagina di check-in.
              Verifica la tua connessione e riprova.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={handleReloadIframe}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Ricarica
              </Button>
              <Button
                onClick={handleCloseIframe}
                variant="outline"
              >
                Chiudi
              </Button>
            </div>
          </div>
        )}

        {/* Iframe */}
        <iframe
          ref={iframeRef}
          src={iframeUrl}
          className="w-full h-full border-0"
          title="Check-in Online"
          allow="camera; geolocation"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        />

        {/* Close Button */}
        <button
          onClick={handleCloseIframe}
          className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-red-600 z-20 flex items-center gap-2"
        >
          <XCircle className="h-4 w-4" />
          Chiudi
        </button>
      </div>
    );
  }

  // ========== STATO: COMPLETED ==========
  if (checkInState.status === 'completed') {
    return (
      <div className="container mx-auto px-4 py-8 pb-24">
        <Card className="max-w-2xl mx-auto border-green-200">
          <CardHeader className="bg-green-50 dark:bg-green-900">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
              <CardTitle className="text-2xl text-green-800 dark:text-green-300">
                Check-in Completato!
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4">
              <p className="text-green-800 dark:text-green-300 font-medium">
                ✅ Il tuo check-in è stato completato con successo.
              </p>
              <p className="text-green-700 dark:text-green-400 text-sm mt-2">
                Riceverai una email di conferma con tutte le informazioni per il tuo soggiorno.
              </p>
            </div>

            {/* Dettagli Prenotazione */}
            <div className="space-y-3">
              {checkInState.apartmentName && (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Appartamento</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {checkInState.apartmentName}
                  </p>
                </div>
              )}

              {checkInState.checkInDate && (
                <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Data Check-in</p>
                  <p className="font-semibold text-blue-900 dark:text-blue-300">
                    {new Date(checkInState.checkInDate).toLocaleDateString('it-IT', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}

              {checkInState.checkOutDate && (
                <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Data Check-out</p>
                  <p className="font-semibold text-blue-900 dark:text-blue-300">
                    {new Date(checkInState.checkOutDate).toLocaleDateString('it-IT', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}

              {checkInState.numberOfGuests && (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Numero Ospiti</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {checkInState.numberOfGuests}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4">
              <Button
                onClick={() => window.location.href = '/'}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                <Home className="mr-2 h-5 w-5" />
                Torna alla Home
              </Button>
              
              <Button
                onClick={handleNewCheckIn}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Nuovo Check-in
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ========== STATO: PENDING / VALIDATED ==========
  if (checkInState.status === 'pending' || checkInState.status === 'validated') {
    return (
      <div className="container mx-auto px-4 py-8 pb-24">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-8 w-8 text-blue-500" />
              <CardTitle className="text-2xl">
                {isCheckInAvailable ? 'Check-in Disponibile!' : 'Check-in Salvato'}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Badge */}
            {isCheckInAvailable ? (
              <div className="bg-green-50 dark:bg-green-900 border-2 border-green-300 dark:border-green-700 rounded-lg p-4">
                <p className="text-green-800 dark:text-green-300 font-semibold flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Il check-in online è ora disponibile!
                </p>
                <p className="text-green-700 dark:text-green-400 text-sm mt-2">
                  Puoi completare il check-in quando vuoi entro la data di arrivo.
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 dark:bg-yellow-900 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg p-4">
                <p className="text-yellow-800 dark:text-yellow-300 font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Check-in non ancora disponibile
                </p>
                <p className="text-yellow-700 dark:text-yellow-400 text-sm mt-2">
                  Il check-in sarà disponibile 3 giorni prima del tuo arrivo.
                </p>
              </div>
            )}

            {/* Countdown */}
            {daysUntilCheckIn !== null && daysUntilCheckIn > 0 && (
              <div className="text-center py-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 rounded-lg">
                <p className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {daysUntilCheckIn}
                </p>
                <p className="text-gray-700 dark:text-gray-300 font-medium">
                  {daysUntilCheckIn === 1 ? 'giorno mancante' : 'giorni mancanti'}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  al tuo arrivo
                </p>
              </div>
            )}

            {/* Dettagli Prenotazione */}
            <div className="space-y-3">
              {checkInState.apartmentName && (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Appartamento</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {checkInState.apartmentName}
                  </p>
                </div>
              )}

              {checkInState.checkInDate && (
                <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Data arrivo prevista</p>
                  <p className="font-semibold text-blue-900 dark:text-blue-300">
                    {new Date(checkInState.checkInDate).toLocaleDateString('it-IT', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}

              {checkInState.checkOutDate && (
                <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Data partenza prevista</p>
                  <p className="font-semibold text-blue-900 dark:text-blue-300">
                    {new Date(checkInState.checkOutDate).toLocaleDateString('it-IT', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* ✅ Notifiche - STATO MIGLIORATO */}
            {checkInState.notificationSent && (
              <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4">
                <p className="text-green-800 dark:text-green-300 text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  🔔 Ti abbiamo inviato una notifica perché il check-in è disponibile!
                </p>
              </div>
            )}
            {checkInState.notificationScheduled && !checkInState.notificationSent && !isCheckInAvailable && (
              <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <p className="text-blue-800 dark:text-blue-300 text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  🔔 Ti invieremo una notifica quando il check-in sarà disponibile
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3 pt-4">
              {isCheckInAvailable ? (
                <Button
                  onClick={handleStartCheckIn}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  <LogIn className="mr-2 h-5 w-5" />
                  Completa Check-in Ora
                </Button>
              ) : (
                <Button
                  disabled
                  className="w-full bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
                  size="lg"
                >
                  <Clock className="mr-2 h-5 w-5" />
                  Check-in non ancora disponibile
                </Button>
              )}

              <Button
                onClick={resetCheckInState}
                variant="outline"
                className="w-full"
              >
                Annulla / Cambia Prenotazione
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ========== STATO: IDLE (Iniziale) ==========
  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-blue-900 dark:text-blue-400 text-center">
            Check-in Online
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Icon & Intro */}
          <div className="text-center">
            <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
              <LogIn className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-lg">
              Completa il tuo check-in online in modo semplice e veloce
            </p>
          </div>

          {/* Vantaggi */}
          <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-4 text-lg">
              Vantaggi del Check-in Online:
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-blue-800 dark:text-blue-300">
                  Ricevi il <strong>codice di accesso</strong> direttamente via email
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-blue-800 dark:text-blue-300">
                  <strong>Evita code e attese</strong> all'arrivo
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-blue-800 dark:text-blue-300">
                  Disponibile <strong>24/7</strong>, quando vuoi tu
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-blue-800 dark:text-blue-300">
                  Ti ricordiamo quando è il momento di fare il check-in
                </span>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <Button
            onClick={handleStartCheckIn}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            <LogIn className="mr-2 h-5 w-5" />
            Inizia Check-in Online
          </Button>

          {/* Info */}
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <span>
                Il check-in online è disponibile da <strong>3 giorni prima</strong> fino a <strong>1 giorno dopo</strong> la data di arrivo prevista.
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckIn;
