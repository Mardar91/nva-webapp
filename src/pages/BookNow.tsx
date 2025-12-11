// ============================================
// APP: NVA (React App)
// FILE: src/pages/BookNow.tsx
// ============================================

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Calendar,
  Home,
  CreditCard,
  CheckCircle,
  XCircle,
  RefreshCw,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useGuestSession } from '../hooks/useGuestSession';
import { useNotifications } from '../hooks/useNotifications';
import { BOOKING_CONFIG, isAllowedBookingOrigin } from '../config/booking';

const BookNow: React.FC = () => {
  const navigate = useNavigate();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const { login: guestLogin, refreshSession } = useGuestSession();
  const { deviceId } = useNotifications();

  // States
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [iframeReady, setIframeReady] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingData, setBookingData] = useState<{
    bookingReference: string;
    email: string;
    guestName?: string;
    apartmentName?: string;
    checkIn?: string;
    checkOut?: string;
    amount?: number;
    currency?: string;
  } | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Build iframe URL with embedded parameter
  const iframeUrl = `${BOOKING_CONFIG.IFRAME_URL}?embedded=true`;

  // Timeout for iframe loading
  useEffect(() => {
    if (iframeReady || loadError) return;

    const timeout = setTimeout(() => {
      if (!iframeReady && !loadError) {
        console.error('[BOOK NOW] Iframe loading timeout');
        setLoadError(true);
        setIsLoading(false);
      }
    }, BOOKING_CONFIG.IFRAME_TIMEOUT);

    return () => clearTimeout(timeout);
  }, [iframeReady, loadError]);

  // Handle postMessage events from Channel Manager
  const handleMessage = useCallback(async (event: MessageEvent) => {
    // Security check: only accept messages from allowed origins
    if (!isAllowedBookingOrigin(event.origin)) {
      console.warn('[BOOK NOW] Message from unauthorized origin:', event.origin);
      return;
    }

    const { type, data } = event.data;
    console.log('[BOOK NOW] Message received:', type, data);

    switch (type) {
      case 'BOOKING_IFRAME_READY':
        console.log('[BOOK NOW] Iframe ready');
        setIframeReady(true);
        setIsLoading(false);
        setLoadError(false);
        break;

      case 'BOOKING_CONFIRMED':
        console.log('[BOOK NOW] Booking confirmed!', data);

        if (!data?.bookingReference || !data?.email) {
          console.error('[BOOK NOW] Missing required data in BOOKING_CONFIRMED');
          return;
        }

        setBookingData({
          bookingReference: data.bookingReference,
          email: data.email,
          guestName: data.guestName,
          apartmentName: data.apartmentName,
          checkIn: data.checkIn,
          checkOut: data.checkOut,
          amount: data.amount,
          currency: data.currency || 'EUR'
        });
        setBookingConfirmed(true);

        // Auto-login after booking confirmation
        setIsLoggingIn(true);
        try {
          const success = await guestLogin(data.bookingReference, data.email, deviceId);
          if (success) {
            console.log('[BOOK NOW] Auto-login successful');
            setLoginSuccess(true);
            await refreshSession();

            // Redirect to My Stay after short delay
            setTimeout(() => {
              navigate('/my-stay');
            }, 2000);
          } else {
            console.error('[BOOK NOW] Auto-login failed');
            setIsLoggingIn(false);
          }
        } catch (error) {
          console.error('[BOOK NOW] Auto-login error:', error);
          setIsLoggingIn(false);
        }
        break;

      case 'BOOKING_CLOSE':
        console.log('[BOOK NOW] Close requested');
        navigate('/');
        break;
    }
  }, [guestLogin, deviceId, refreshSession, navigate]);

  // Add message event listener
  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  // Hide floating chat button while iframe is open
  useEffect(() => {
    const chatButton = document.querySelector('.floating-chat-button') as HTMLElement;
    if (chatButton) {
      chatButton.style.display = 'none';
    }
    return () => {
      if (chatButton) {
        chatButton.style.display = 'flex';
      }
    };
  }, []);

  // Handle reload
  const handleReload = () => {
    setLoadError(false);
    setIframeReady(false);
    setIsLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = iframeUrl;
    }
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // ========== BOOKING CONFIRMED VIEW ==========
  if (bookingConfirmed && bookingData) {
    return (
      <div
        className="absolute inset-0 overflow-y-auto overflow-x-hidden bg-white dark:bg-[#1a1a1a]"
        style={{
          bottom: 'calc(72px + env(safe-area-inset-bottom))',
          top: 0,
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div className="container mx-auto px-4 py-8 pb-24">
          <div className="max-w-2xl mx-auto">
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="bg-green-100 dark:bg-green-900 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-3xl font-bold text-green-800 dark:text-green-300 mb-2">
                Booking Confirmed!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Thank you for your reservation
              </p>
            </div>

            {/* Booking Details Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Booking Details
                </h2>
              </div>

              <div className="space-y-4">
                {bookingData.guestName && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Guest</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {bookingData.guestName}
                    </span>
                  </div>
                )}

                {bookingData.apartmentName && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Apartment</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {bookingData.apartmentName}
                    </span>
                  </div>
                )}

                {bookingData.checkIn && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Check-in</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatDate(bookingData.checkIn)}
                    </span>
                  </div>
                )}

                {bookingData.checkOut && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Check-out</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatDate(bookingData.checkOut)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Booking Reference</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                    {bookingData.bookingReference}
                  </span>
                </div>

                {bookingData.amount && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 dark:text-gray-400">Total Paid</span>
                    <span className="font-bold text-green-600 dark:text-green-400 text-lg">
                      {bookingData.currency} {bookingData.amount.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Login Status */}
            <div className={`rounded-xl p-4 mb-6 ${
              loginSuccess
                ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800'
                : isLoggingIn
                  ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800'
                  : 'bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800'
            }`}>
              {loginSuccess ? (
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-300">
                      You're now logged in!
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      Redirecting to My Reservation...
                    </p>
                  </div>
                </div>
              ) : isLoggingIn ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-spin" />
                  <div>
                    <p className="font-medium text-blue-800 dark:text-blue-300">
                      Setting up your account...
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      Please wait a moment
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  <div>
                    <p className="font-medium text-yellow-800 dark:text-yellow-300">
                      Auto-login was not completed
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                      You can login manually using your booking reference and email
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {!loginSuccess && !isLoggingIn && (
              <div className="space-y-3">
                <Button
                  onClick={() => navigate('/my-stay')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  Go to My Reservation
                </Button>
                <Button
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="w-full"
                >
                  <Home className="mr-2 h-5 w-5" />
                  Back to Home
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ========== MAIN IFRAME VIEW ==========
  return (
    <div
      className="fixed inset-0 z-40 bg-white dark:bg-[#1a1a1a]"
      style={{ bottom: 'calc(72px + env(safe-area-inset-bottom))' }}
    >
      {/* Loading Spinner */}
      {isLoading && !loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 dark:bg-[#1a1a1a]/95 z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300 font-medium">Loading booking page...</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Please wait</p>
        </div>
      )}

      {/* Error State */}
      {loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-[#1a1a1a] z-10 p-6">
          <XCircle className="h-16 w-16 text-red-500 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Loading Error
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            Unable to load the booking page. Please check your connection and try again.
          </p>
          <div className="flex gap-3">
            <Button
              onClick={handleReload}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reload
            </Button>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
            >
              Back to Home
            </Button>
          </div>
        </div>
      )}

      {/* Iframe */}
      <iframe
        ref={iframeRef}
        src={iframeUrl}
        className="w-full h-full border-0"
        title="Book Now"
        allow="payment"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
      />
    </div>
  );
};

export default BookNow;
