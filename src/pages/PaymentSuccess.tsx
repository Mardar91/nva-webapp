// ============================================
// APP: NVA (React App)
// FILE: src/pages/PaymentSuccess.tsx
// PURPOSE: Handle return from Stripe payment (embedded flow)
// ============================================

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGuestSession } from '../hooks/useGuestSession';
import { useNotifications } from '../hooks/useNotifications';
import { CheckCircle, XCircle, Loader2, Gift, Calendar, Home } from 'lucide-react';
import { Button } from '../components/ui/button';

type PageStatus = 'loading' | 'success' | 'error';

const PaymentSuccess: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, isLoggedIn } = useGuestSession();
  const { deviceId } = useNotifications();

  const [status, setStatus] = useState<PageStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [countdown, setCountdown] = useState(3);

  // Get parameters from URL
  const bookingRef = searchParams.get('ref');
  const email = searchParams.get('email');
  const paymentType = searchParams.get('type') || 'booking'; // 'booking' or 'giftcard'
  const amount = searchParams.get('amount');

  useEffect(() => {
    const processPaymentReturn = async () => {
      // For gift cards, no login needed - just show success
      if (paymentType === 'giftcard') {
        setStatus('success');
        return;
      }

      // For bookings, attempt auto-login
      if (!bookingRef || !email) {
        console.warn('[PAYMENT SUCCESS] Missing ref or email, showing success without login');
        setStatus('success');
        return;
      }

      // If already logged in, just show success
      if (isLoggedIn) {
        console.log('[PAYMENT SUCCESS] Already logged in');
        setStatus('success');
        return;
      }

      console.log('[PAYMENT SUCCESS] Attempting auto-login...', { bookingRef, email });

      try {
        const success = await login(bookingRef, email, deviceId);

        if (success) {
          console.log('[PAYMENT SUCCESS] Auto-login successful');
          setStatus('success');
        } else {
          console.warn('[PAYMENT SUCCESS] Auto-login failed, showing success anyway');
          // Still show success - payment was completed, login is secondary
          setStatus('success');
        }
      } catch (err) {
        console.error('[PAYMENT SUCCESS] Auto-login error:', err);
        // Still show success - payment was completed
        setStatus('success');
      }
    };

    processPaymentReturn();
  }, [bookingRef, email, paymentType, login, isLoggedIn, deviceId]);

  // Countdown and redirect
  useEffect(() => {
    if (status !== 'success') return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirect based on payment type
          if (paymentType === 'giftcard') {
            navigate('/', { replace: true });
          } else {
            navigate('/my-stay', { replace: true });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, paymentType, navigate]);

  // Format amount for display
  const formatAmount = (amountInCents: string | null) => {
    if (!amountInCents) return null;
    const euros = parseInt(amountInCents) / 100;
    return `€${euros.toFixed(2)}`;
  };

  const isGiftCard = paymentType === 'giftcard';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="h-16 w-16 text-blue-500 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('paymentSuccess.processing')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('paymentSuccess.pleaseWait')}
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            {/* Success Icon */}
            <div className="relative mx-auto mb-6">
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              {/* Payment type badge */}
              <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center ${
                isGiftCard
                  ? 'bg-purple-500'
                  : 'bg-blue-500'
              }`}>
                {isGiftCard ? (
                  <Gift className="h-4 w-4 text-white" />
                ) : (
                  <Calendar className="h-4 w-4 text-white" />
                )}
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {isGiftCard
                ? t('paymentSuccess.giftCardSuccess')
                : t('paymentSuccess.bookingSuccess')
              }
            </h2>

            {/* Subtitle */}
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {isGiftCard
                ? t('paymentSuccess.giftCardMessage')
                : t('paymentSuccess.bookingMessage')
              }
            </p>

            {/* Details */}
            {(bookingRef || amount) && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6 space-y-2">
                {bookingRef && !isGiftCard && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      {t('paymentSuccess.reference')}
                    </span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                      {bookingRef}
                    </span>
                  </div>
                )}
                {amount && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      {t('paymentSuccess.amount')}
                    </span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      {formatAmount(amount)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Countdown */}
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {t('paymentSuccess.redirecting', { seconds: countdown })}
            </p>

            {/* Manual navigation button */}
            <Button
              onClick={() => navigate(isGiftCard ? '/' : '/my-stay', { replace: true })}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
              size="lg"
            >
              <Home className="mr-2 h-5 w-5" />
              {isGiftCard
                ? t('paymentSuccess.goHome')
                : t('paymentSuccess.goToMyStay')
              }
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('paymentSuccess.error')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {errorMessage || t('paymentSuccess.errorMessage')}
            </p>
            <Button
              onClick={() => navigate('/', { replace: true })}
              variant="outline"
              className="w-full"
            >
              <Home className="mr-2 h-5 w-5" />
              {t('common.backToHome')}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
