// ============================================
// 📱 APP: NVA (React App)
// 📄 FILE: src/pages/CheckIn.tsx
// ============================================

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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

  useEffect(() => {
    if (!showIframe || iframeReady || loadError) return;
    const timeout = setTimeout(() => {
      if (!iframeReady && !loadError) {
        console.error('⏱️ Iframe loading timeout');
        setLoadError(true);
        setIsLoading(false);
      }
    }, CHECKIN_CONFIG.IFRAME_TIMEOUT);

    return () => clearTimeout(timeout);
  }, [showIframe, iframeReady, loadError]);

  useEffect(() => {
    if (isLoading) {
      updateCheckInState({ status: 'loading' });
    }
  }, [isLoading, updateCheckInState]);

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

  const handleMessage = useCallback(async (event: MessageEvent) => {
    if (!isAllowedOrigin(event.origin)) {
      console.warn('⚠️ Message from unauthorized origin:', event.origin);
      return;
    }
    const { type, data } = event.data;
    console.log('📨 Message received:', type, data);

    switch (type) {
      case 'CHECKIN_IFRAME_READY':
        console.log('✅ Iframe ready');
        setIframeReady(true);
        setIsLoading(false);
        setLoadError(false);
        break;

      case 'CHECKIN_VALIDATION_READY':
        console.log('✅ Validation ready');
        setIsLoading(false);
        break;

      case 'CHECKIN_PENDING':
        console.log('⏳ Check-in pending (not yet available):', data);
        
        updateCheckInState({
          status: 'pending',
          bookingId: data.bookingId,
          apartmentName: data.apartmentName || (data.mode === 'unassigned_checkin' ? 'To be assigned' : 'Apartment'),
          checkInDate: data.checkInDate,
          checkOutDate: data.checkOutDate,
          numberOfGuests: data.numberOfGuests || 1,
          mode: data.mode,
          savedEmail: data.savedEmail,
          savedBookingRef: data.savedBookingRef
        });

        if (data.checkInDate && deviceId) {
          const result = await scheduleCheckInReminder({
            checkInDate: data.checkInDate,
            deviceId: deviceId,
            bookingReference: data.savedBookingRef || data.bookingId || 'unknown'
          });
          
          if (result.scheduled) {
            updateCheckInState({ 
              notificationScheduled: true,
              notificationSent: false
            });
          }
        } else if (data.checkInDate && !deviceId) {
          console.warn('⚠️ Cannot schedule notification: deviceId missing');
        }
        
        setTimeout(() => {
          setShowIframe(false);
        }, 2000);
        break;

      case 'CHECKIN_VALIDATED':
        console.log('✅ Check-in validated:', data);
        
        updateCheckInState({
          status: 'validated',
          bookingId: data.bookingId,
          apartmentName: data.apartmentName || (data.mode === 'unassigned_checkin' ? 'To be assigned' : 'Apartment'),
          checkInDate: data.checkInDate,
          checkOutDate: data.checkOutDate,
          numberOfGuests: data.numberOfGuests || 1,
          mode: data.mode,
          savedEmail: data.savedEmail,
          savedBookingRef: data.savedBookingRef
        });

        if (data.checkInDate && deviceId) {
          const result = await scheduleCheckInReminder({
            checkInDate: data.checkInDate,
            deviceId: deviceId,
            bookingReference: data.savedBookingRef || data.bookingId || 'unknown'
          });
          
          if (result.scheduled) {
            updateCheckInState({ 
              notificationScheduled: true,
              notificationSent: result.sentImmediately || false
            });
          }
        } else if (data.checkInDate && !deviceId) {
          console.warn('⚠️ Cannot schedule notification: deviceId missing');
        }
        break;

      case 'CHECKIN_FORM_READY':
        console.log('✅ Check-in form ready');
        updateCheckInState({ status: 'form_ready' });
        break;

      case 'CHECKIN_FORM_SUBMITTED':
        console.log('✅ Form submitted:', data);
        break;

      case 'CHECKIN_COMPLETED':
        console.log('🎉 Check-in completed!', data);

        // ✅ FIX: Aggiorna numberOfGuests con il valore effettivo dal check-in completato
        updateCheckInState({
          status: 'completed',
          completedAt: data.timestamp,
          // Aggiorna numberOfGuests se presente nel messaggio (importante per prenotazioni iCal)
          ...(data.numberOfGuests && { numberOfGuests: data.numberOfGuests }),
          // Aggiorna anche altri campi se presenti
          ...(data.apartmentName && { apartmentName: data.apartmentName }),
          ...(data.bookingId && { bookingId: data.bookingId })
        });

        setTimeout(() => {
          setShowIframe(false);
        }, 2000);
        break;

      case 'CHECKIN_CLOSE_REQUESTED':
        console.log('🚪 Close iframe requested');
        setShowIframe(false);
        break;
    }
  }, [deviceId, updateCheckInState]);

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  const handleStartCheckIn = () => {
    setIsLoading(true);
    setLoadError(false);
    setIframeReady(false);
    const params = new URLSearchParams();

    if (checkInState.savedEmail) {
      params.set('email', checkInState.savedEmail);
    }
    if (checkInState.savedBookingRef) {
      params.set('bookingRef', checkInState.savedBookingRef);
    }

    const url = `${CHECKIN_CONFIG.IFRAME_URL}?${params.toString()}`;
    console.log('🚀 Opening iframe:', url);

    setIframeUrl(url);
    setShowIframe(true);
  };

  const handleReloadIframe = () => {
    setLoadError(false);
    setIframeReady(false);
    setIsLoading(true);
    setShowIframe(false);
    setTimeout(() => {
      setShowIframe(true);
    }, 100);
  };

  const handleNewCheckIn = () => {
    resetCheckInState();
    handleStartCheckIn();
  };

  const handleCloseIframe = () => {
    setShowIframe(false);
    setIsLoading(false);
    setLoadError(false);
    setIframeReady(false);
  };

  // ========== IFRAME RENDERING ==========
  if (showIframe) {
    return (
      <div className="fixed inset-0 z-40 bg-white dark:bg-[#1a1a1a]" style={{ bottom: '88px' }}>
        {isLoading && !loadError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 dark:bg-[#1a1a1a]/95 z-10">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
            <p className="text-gray-700 dark:text-gray-300 font-medium">Loading check-in...</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Please wait</p>
          </div>
        )}

        {loadError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-[#1a1a1a] z-10 p-6">
            <XCircle className="h-16 w-16 text-red-500 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Loading Error
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              Unable to load the check-in page. Please check your connection and try again.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={handleReloadIframe}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reload
              </Button>
              <Button
                onClick={handleCloseIframe}
                variant="outline"
              >
                Close
              </Button>
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={iframeUrl}
          className="w-full h-full border-0"
          title="Online Check-in"
          allow="camera; geolocation"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        />
      </div>
    );
  }

  // ========== WRAPPER CON SCROLL PER TUTTO IL RESTO ==========
  return (
    <div 
      className="absolute inset-0 overflow-y-auto overflow-x-hidden"
      style={{
        bottom: '88px',
        top: 0,
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        touchAction: 'pan-y',
      }}
    >
      <div className="container mx-auto px-4 py-8 pb-24">
        
        {/* ========== STATE: COMPLETED ========== */}
        {checkInState.status === 'completed' && (
          <Card className="max-w-2xl mx-auto border-green-200 dark:border-green-800">
            <CardHeader className="bg-green-50 dark:bg-green-900">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                <CardTitle className="text-2xl text-green-800 dark:text-green-300">
                  Check-in Completed!
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4">
                <p className="text-green-800 dark:text-green-300 font-medium">
                  ✅ Your check-in has been completed successfully.
                </p>
                <p className="text-green-700 dark:text-green-400 text-sm mt-2">
                  You will receive a confirmation email with all the information for your stay.
                </p>
              </div>
              <div className="space-y-3">
                {checkInState.apartmentName && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Apartment</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {checkInState.apartmentName}
                    </p>
                  </div>
                )}

                {checkInState.checkInDate && (
                  <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Check-in Date</p>
                    <p className="font-semibold text-blue-900 dark:text-blue-300">
                      {new Date(checkInState.checkInDate).toLocaleDateString('en-US', {
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">Check-out Date</p>
                    <p className="font-semibold text-blue-900 dark:text-blue-300">
                      {new Date(checkInState.checkOutDate).toLocaleDateString('en-US', {
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">Number of Guests</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {checkInState.numberOfGuests}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-4">
                <Button
                  onClick={() => window.location.href = '/'}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  <Home className="mr-2 h-5 w-5" />
                  Back to Home
                </Button>
                
                <Button
                  onClick={handleNewCheckIn}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  New Check-in
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ========== STATE: PENDING / VALIDATED ========== */}
        {(checkInState.status === 'pending' || checkInState.status === 'validated') && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <div className="flex items-center gap-3">
                <CalendarIcon className="h-8 w-8 text-blue-500" />
                <CardTitle className="text-2xl">
                  {checkInState.status === 'pending'
                    ? 'Check-in Saved'
                    : (isCheckInAvailable ? 'Check-in Available!' : 'Check-in Saved')
                  }
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {checkInState.status === 'pending' ? (
                <div className="bg-blue-50 dark:bg-blue-900 border-2 border-blue-300 dark:border-blue-700 rounded-lg p-4">
                  <p className="text-blue-800 dark:text-blue-300 font-semibold flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Your booking has been saved!
                  </p>
                  <p className="text-blue-700 dark:text-blue-400 text-sm mt-2">
                    Check-in will be available 7 days before your arrival. We'll notify you when it's ready!
                  </p>
                </div>
              ) : isCheckInAvailable ? (
                <div className="bg-green-50 dark:bg-green-900 border-2 border-green-300 dark:border-green-700 rounded-lg p-4">
                  <p className="text-green-800 dark:text-green-300 font-semibold flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Online check-in is now available!
                  </p>
                  <p className="text-green-700 dark:text-green-400 text-sm mt-2">
                    You can complete your check-in anytime before your arrival date.
                  </p>
                </div>
              ) : (
                <div className="bg-yellow-50 dark:bg-yellow-900 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg p-4">
                  <p className="text-yellow-800 dark:text-yellow-300 font-semibold flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Check-in not yet available
                  </p>
                  <p className="text-yellow-700 dark:text-yellow-400 text-sm mt-2">
                    Check-in will be available 7 days before your arrival.
                  </p>
                </div>
              )}
              
              {daysUntilCheckIn !== null && daysUntilCheckIn > 0 && (
                <div className="text-center py-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 rounded-lg">
                  <p className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {daysUntilCheckIn}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 font-medium">
                    {daysUntilCheckIn === 1 ? 'day remaining' : 'days remaining'}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    until your arrival
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {checkInState.apartmentName && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Apartment</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {checkInState.apartmentName}
                    </p>
                  </div>
                )}

                {checkInState.checkInDate && (
                  <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Expected arrival date</p>
                    <p className="font-semibold text-blue-900 dark:text-blue-300">
                      {new Date(checkInState.checkInDate).toLocaleDateString('en-US', {
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">Expected departure date</p>
                    <p className="font-semibold text-blue-900 dark:text-blue-300">
                      {new Date(checkInState.checkOutDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>

              {checkInState.notificationSent && (
                <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4">
                  <p className="text-green-800 dark:text-green-300 text-sm flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    🔔 We sent you a notification because check-in is available!
                  </p>
                </div>
              )}
              {checkInState.notificationScheduled && !checkInState.notificationSent && !isCheckInAvailable && (
                <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                  <p className="text-blue-800 dark:text-blue-300 text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    🔔 We'll send you a notification when check-in becomes available
                  </p>
                </div>
              )}

              <div className="space-y-3 pt-4">
                {isCheckInAvailable ? (
                  <Button
                    onClick={handleStartCheckIn}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    size="lg"
                  >
                    <LogIn className="mr-2 h-5 w-5" />
                    Complete Check-in Now
                  </Button>
                ) : (
                  <Button
                    disabled
                    className="w-full bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
                    size="lg"
                  >
                    <Clock className="mr-2 h-5 w-5" />
                    Check-in not yet available
                  </Button>
                )}

                <Button
                  onClick={resetCheckInState}
                  variant="outline"
                  className="w-full"
                >
                  Cancel / Change Booking
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ========== STATE: IDLE ========== */}
        {checkInState.status !== 'completed' && checkInState.status !== 'pending' && checkInState.status !== 'validated' && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-blue-900 dark:text-blue-400 text-center">
                Online Check-in
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                  <LogIn className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-lg">
                  Complete your online check-in quickly and easily
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-4 text-lg">
                  Benefits of Online Check-in:
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">
                      Receive your <strong>access code</strong> directly via email
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">
                      <strong>Avoid queues and waiting</strong> upon arrival
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">
                      Available <strong>24/7</strong>, whenever you want
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">
                      We'll remind you when it's time to check in
                    </span>
                  </li>
                </ul>
              </div>

              <Button
                onClick={handleStartCheckIn}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                <LogIn className="mr-2 h-5 w-5" />
                Start Online Check-in
              </Button>

              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span>
                    Online check-in is available from <strong>7 days before</strong> your expected arrival date.
                    <span className="block mt-2 text-xs text-gray-500 dark:text-gray-500">
                      💡 <em>Please note: on-site check-in has a cost of €39</em>
                    </span>
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        
      </div>
    </div>
  );
};

export default CheckIn;
