// ============================================
// APP: NVA (React App)
// FILE: src/pages/CheckIn.tsx
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
  Home,
  User,
  CalendarCheck,
  Loader2
} from "lucide-react";
import { useCheckInState } from '../hooks/useCheckInState';
import { useNotifications } from '../hooks/useNotifications';
import { useGuestSession } from '../hooks/useGuestSession';
import { scheduleCheckInReminder } from '../lib/checkInReminders';
import { CHECKIN_CONFIG, isAllowedOrigin } from '../config/checkin';
import AccessCodeSection from '../components/AccessCodeSection';

const CheckIn = () => {
  const {
    checkInState,
    updateCheckInState,
    resetCheckInState,
    isCheckInAvailable,
    daysUntilCheckIn
  } = useCheckInState();
  const { deviceId } = useNotifications();
  const {
    isLoggedIn,
    token,
    booking,
    guestName,
    refreshSession,
    isLoading: sessionLoading,
    login: guestLogin
  } = useGuestSession();

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [showIframe, setShowIframe] = useState(false);
  const [iframeUrl, setIframeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [iframeReady, setIframeReady] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refresh booking data when page loads (if logged in)
  useEffect(() => {
    if (isLoggedIn && token) {
      setIsRefreshing(true);
      refreshSession().finally(() => setIsRefreshing(false));
    }
  }, []);

  // Helper functions for logged in user
  const isStayPast = useCallback(() => {
    if (!booking?.checkOut) return false;
    const checkOutDate = new Date(booking.checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    checkOutDate.setHours(0, 0, 0, 0);
    return today > checkOutDate;
  }, [booking?.checkOut]);

  const isCheckInAvailableForBooking = useCallback(() => {
    if (!booking?.checkIn) return false;
    const checkInDate = new Date(booking.checkIn);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    checkInDate.setUTCHours(0, 0, 0, 0);
    const daysUntil = Math.ceil((checkInDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil >= -1 && daysUntil <= 7;
  }, [booking?.checkIn]);

  const getDaysUntilCheckInForBooking = useCallback(() => {
    if (!booking?.checkIn) return null;
    const checkInDate = new Date(booking.checkIn);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    checkInDate.setUTCHours(0, 0, 0, 0);
    return Math.ceil((checkInDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }, [booking?.checkIn]);

  useEffect(() => {
    if (!showIframe || iframeReady || loadError) return;
    const timeout = setTimeout(() => {
      if (!iframeReady && !loadError) {
        console.error('Iframe loading timeout');
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
      console.warn('Message from unauthorized origin:', event.origin);
      return;
    }
    const { type, data } = event.data;
    console.log('Message received:', type, data);

    switch (type) {
      case 'CHECKIN_IFRAME_READY':
        console.log('Iframe ready');
        setIframeReady(true);
        setIsLoading(false);
        setLoadError(false);
        break;

      case 'CHECKIN_VALIDATION_READY':
        console.log('Validation ready');
        setIsLoading(false);
        break;

      case 'CHECKIN_PENDING':
        console.log('Check-in pending (not yet available):', data);

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
        }

        setTimeout(() => {
          setShowIframe(false);
        }, 2000);
        break;

      case 'CHECKIN_VALIDATED':
        console.log('Check-in validated:', data);

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
        }
        break;

      case 'CHECKIN_FORM_READY':
        console.log('Check-in form ready');
        updateCheckInState({ status: 'form_ready' });
        break;

      case 'CHECKIN_FORM_SUBMITTED':
        console.log('Form submitted:', data);
        break;

      case 'CHECKIN_COMPLETED':
        console.log('Check-in completed!', data);

        updateCheckInState({
          status: 'completed',
          completedAt: data.timestamp,
          ...(data.numberOfGuests && { numberOfGuests: data.numberOfGuests }),
          ...(data.apartmentName && { apartmentName: data.apartmentName }),
          ...(data.bookingId && { bookingId: data.bookingId })
        });

        // Auto-login for direct bookings (mode='normal')
        if (data.mode === 'normal' && data.email && checkInState.savedBookingRef) {
          console.log('Auto-login after check-in completion...');
          guestLogin(checkInState.savedBookingRef, data.email, deviceId)
            .then(success => {
              if (success) {
                console.log('Auto-login successful');
                // Refresh to get updated booking data
                refreshSession();
              }
            })
            .catch(err => {
              console.error('Auto-login error:', err);
            });
        }

        // Auto-login for iCal bookings (mode='unassigned_checkin')
        if (data.mode === 'unassigned_checkin' && data.email && data.bookingReference) {
          console.log('Auto-login after iCal check-in completion...');
          guestLogin(data.bookingReference, data.email, deviceId)
            .then(success => {
              if (success) {
                console.log('Auto-login (iCal) successful');
                refreshSession();
              }
            })
            .catch(err => {
              console.error('Auto-login (iCal) error:', err);
            });
        }

        setTimeout(() => {
          setShowIframe(false);
        }, 2000);
        break;

      case 'CHECKIN_CLOSE_REQUESTED':
        console.log('Close iframe requested');
        setShowIframe(false);
        break;
    }
  }, [deviceId, updateCheckInState, guestLogin, checkInState.savedBookingRef, refreshSession]);

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  const handleStartCheckIn = (email?: string, bookingRef?: string) => {
    setIsLoading(true);
    setLoadError(false);
    setIframeReady(false);
    const params = new URLSearchParams();

    // Use provided values or fall back to checkInState
    const emailToUse = email || checkInState.savedEmail;
    const bookingRefToUse = bookingRef || checkInState.savedBookingRef;

    if (emailToUse) {
      params.set('email', emailToUse);
    }
    if (bookingRefToUse) {
      params.set('bookingRef', bookingRefToUse);
    }
    if (deviceId) {
      params.set('deviceId', deviceId);
    }

    const url = `${CHECKIN_CONFIG.IFRAME_URL}?${params.toString()}`;
    console.log('Opening iframe:', url);

    setIframeUrl(url);
    setShowIframe(true);
  };

  const handleStartCheckInForLoggedUser = () => {
    if (booking?.guestEmail && booking?.bookingReference) {
      handleStartCheckIn(booking.guestEmail, booking.bookingReference);
    } else {
      handleStartCheckIn();
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  // ========== LOADING STATE ==========
  if (isRefreshing || sessionLoading) {
    return (
      <div
        className="absolute inset-0 overflow-y-auto overflow-x-hidden"
        style={{ bottom: '88px', top: 0 }}
      >
        <div className="container mx-auto px-4 py-8 pb-24 flex items-center justify-center min-h-full">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading your booking...</p>
          </div>
        </div>
      </div>
    );
  }

  // ========== LOGGED IN USER VIEW ==========
  if (isLoggedIn && booking) {
    const stayPast = isStayPast();
    const checkInAvailable = isCheckInAvailableForBooking();
    const daysUntil = getDaysUntilCheckInForBooking();

    // ========== STAY COMPLETED (Past checkout date) ==========
    if (stayPast) {
      return (
        <div
          className="absolute inset-0 overflow-y-auto overflow-x-hidden"
          style={{ bottom: '88px', top: 0, WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain', touchAction: 'pan-y' }}
        >
          <div className="container mx-auto px-4 py-8 pb-24">
            <Card className="max-w-2xl mx-auto border-gray-200 dark:border-gray-700">
              <CardHeader className="bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <CalendarCheck className="h-10 w-10 text-gray-500 dark:text-gray-400" />
                  <CardTitle className="text-2xl text-gray-700 dark:text-gray-300">
                    Stay Completed
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-4">
                  <User className="h-5 w-5" />
                  <span>Welcome back, <strong>{guestName}</strong>!</span>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <p className="text-gray-700 dark:text-gray-300 font-medium">
                    Thank you for staying with us!
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                    Your stay at Nonna Vittoria Apartments has ended. We hope you had a wonderful time!
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Apartment</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {booking.apartmentName}
                    </p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Check-in Date</p>
                    <p className="font-semibold text-blue-900 dark:text-blue-300">
                      {formatDate(booking.checkIn)}
                    </p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Check-out Date</p>
                    <p className="font-semibold text-blue-900 dark:text-blue-300">
                      {formatDate(booking.checkOut)}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Number of Guests</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {booking.numberOfGuests}
                    </p>
                  </div>
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
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    // ========== CHECK-IN COMPLETED ==========
    if (booking.onlineCheckInCompleted) {
      return (
        <div
          className="absolute inset-0 overflow-y-auto overflow-x-hidden"
          style={{ bottom: '88px', top: 0, WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain', touchAction: 'pan-y' }}
        >
          <div className="container mx-auto px-4 py-8 pb-24">
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
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-4">
                  <User className="h-5 w-5" />
                  <span>Welcome, <strong>{guestName}</strong>!</span>
                </div>

                <div className="bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-700 rounded-lg p-4">
                  <p className="text-green-800 dark:text-green-300 font-medium">
                    Your online check-in has been completed successfully.
                  </p>
                  <p className="text-green-700 dark:text-green-400 text-sm mt-2">
                    You can view your access code below. Have a wonderful stay!
                  </p>
                </div>

                {daysUntil !== null && daysUntil > 0 && (
                  <div className="text-center py-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg">
                    <p className="text-5xl font-bold text-green-600 dark:text-green-400 mb-2">
                      {daysUntil}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 font-medium">
                      {daysUntil === 1 ? 'day until your arrival' : 'days until your arrival'}
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Apartment</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {booking.apartmentName}
                    </p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Check-in Date</p>
                    <p className="font-semibold text-blue-900 dark:text-blue-300">
                      {formatDate(booking.checkIn)}
                    </p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Check-out Date</p>
                    <p className="font-semibold text-blue-900 dark:text-blue-300">
                      {formatDate(booking.checkOut)}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Number of Guests</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {booking.numberOfGuests}
                    </p>
                  </div>
                </div>

                {/* Access Code Section */}
                {token && (
                  <AccessCodeSection
                    token={token}
                    checkInCompleted={true}
                  />
                )}

                <div className="space-y-3 pt-4">
                  <Button
                    onClick={() => window.location.href = '/'}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    <Home className="mr-2 h-5 w-5" />
                    Back to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    // ========== CHECK-IN NOT COMPLETED YET ==========
    return (
      <div
        className="absolute inset-0 overflow-y-auto overflow-x-hidden"
        style={{ bottom: '88px', top: 0, WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain', touchAction: 'pan-y' }}
      >
        <div className="container mx-auto px-4 py-8 pb-24">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <div className="flex items-center gap-3">
                <CalendarIcon className="h-8 w-8 text-blue-500" />
                <CardTitle className="text-2xl">
                  {checkInAvailable ? 'Complete Your Check-in' : 'Your Upcoming Stay'}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-4">
                <User className="h-5 w-5" />
                <span>Welcome, <strong>{guestName}</strong>!</span>
              </div>

              {checkInAvailable ? (
                <div className="bg-green-50 dark:bg-green-900/50 border-2 border-green-300 dark:border-green-700 rounded-lg p-4">
                  <p className="text-green-800 dark:text-green-300 font-semibold flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Online check-in is now available!
                  </p>
                  <p className="text-green-700 dark:text-green-400 text-sm mt-2">
                    Complete your check-in now to receive your access code.
                  </p>
                </div>
              ) : (
                <div className="bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg p-4">
                  <p className="text-yellow-800 dark:text-yellow-300 font-semibold flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Check-in not yet available
                  </p>
                  <p className="text-yellow-700 dark:text-yellow-400 text-sm mt-2">
                    Online check-in will be available 7 days before your arrival.
                  </p>
                </div>
              )}

              {daysUntil !== null && daysUntil > 0 && (
                <div className="text-center py-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg">
                  <p className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {daysUntil}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 font-medium">
                    {daysUntil === 1 ? 'day remaining' : 'days remaining'}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    until your arrival
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Apartment</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {booking.apartmentName}
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Check-in Date</p>
                  <p className="font-semibold text-blue-900 dark:text-blue-300">
                    {formatDate(booking.checkIn)}
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Check-out Date</p>
                  <p className="font-semibold text-blue-900 dark:text-blue-300">
                    {formatDate(booking.checkOut)}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Number of Guests</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {booking.numberOfGuests}
                  </p>
                </div>
              </div>

              {/* Access Code Section - shows message that check-in needed */}
              {token && (
                <AccessCodeSection
                  token={token}
                  checkInCompleted={false}
                />
              )}

              <div className="space-y-3 pt-4">
                {checkInAvailable ? (
                  <Button
                    onClick={handleStartCheckInForLoggedUser}
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
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  className="w-full"
                >
                  <Home className="mr-2 h-5 w-5" />
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ========== NOT LOGGED IN - ORIGINAL BEHAVIOR ==========
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
                  Your check-in has been completed successfully.
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
                      {formatDate(checkInState.checkInDate)}
                    </p>
                  </div>
                )}

                {checkInState.checkOutDate && (
                  <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Check-out Date</p>
                    <p className="font-semibold text-blue-900 dark:text-blue-300">
                      {formatDate(checkInState.checkOutDate)}
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
                      {formatDate(checkInState.checkInDate)}
                    </p>
                  </div>
                )}

                {checkInState.checkOutDate && (
                  <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Expected departure date</p>
                    <p className="font-semibold text-blue-900 dark:text-blue-300">
                      {formatDate(checkInState.checkOutDate)}
                    </p>
                  </div>
                )}
              </div>

              {checkInState.notificationSent && (
                <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4">
                  <p className="text-green-800 dark:text-green-300 text-sm flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    We sent you a notification because check-in is available!
                  </p>
                </div>
              )}
              {checkInState.notificationScheduled && !checkInState.notificationSent && !isCheckInAvailable && (
                <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                  <p className="text-blue-800 dark:text-blue-300 text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    We'll send you a notification when check-in becomes available
                  </p>
                </div>
              )}

              <div className="space-y-3 pt-4">
                {isCheckInAvailable ? (
                  <Button
                    onClick={() => handleStartCheckIn()}
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
                onClick={() => handleStartCheckIn()}
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
                      Please note: on-site check-in has a cost of 39 EUR
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
