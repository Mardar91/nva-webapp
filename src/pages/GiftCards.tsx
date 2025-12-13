// ============================================
// APP: NVA (React App)
// FILE: src/pages/GiftCards.tsx
// ============================================

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/button";
import {
  Gift,
  Home,
  CheckCircle,
  XCircle,
  RefreshCw,
  Loader2
} from "lucide-react";
import { BOOKING_CONFIG, isAllowedBookingOrigin } from '../config/booking';

const GiftCards: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // States
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [iframeReady, setIframeReady] = useState(false);
  const [purchaseConfirmed, setPurchaseConfirmed] = useState(false);
  const [purchaseData, setPurchaseData] = useState<{
    giftCardCode?: string;
    amount?: number;
    currency?: string;
    recipientEmail?: string;
  } | null>(null);

  // Build iframe URL with embedded parameter
  const iframeUrl = `${BOOKING_CONFIG.GIFT_CARD_IFRAME_URL}?embedded=true`;

  // Timeout for iframe loading
  useEffect(() => {
    if (iframeReady || loadError) return;

    const timeout = setTimeout(() => {
      if (!iframeReady && !loadError) {
        console.error('[GIFT CARDS] Iframe loading timeout');
        setLoadError(true);
        setIsLoading(false);
      }
    }, BOOKING_CONFIG.IFRAME_TIMEOUT);

    return () => clearTimeout(timeout);
  }, [iframeReady, loadError]);

  // Handle postMessage events from Channel Manager
  const handleMessage = useCallback((event: MessageEvent) => {
    // Security check: only accept messages from allowed origins
    if (!isAllowedBookingOrigin(event.origin)) {
      console.warn('[GIFT CARDS] Message from unauthorized origin:', event.origin);
      return;
    }

    const { type, data } = event.data;
    console.log('[GIFT CARDS] Message received:', type, data);

    switch (type) {
      case 'GIFTCARD_IFRAME_READY':
        console.log('[GIFT CARDS] Iframe ready');
        setIframeReady(true);
        setIsLoading(false);
        setLoadError(false);
        break;

      case 'GIFTCARD_CONFIRMED':
        console.log('[GIFT CARDS] Gift card purchase confirmed!', data);
        setPurchaseData({
          giftCardCode: data?.giftCardCode,
          amount: data?.amount,
          currency: data?.currency || 'EUR',
          recipientEmail: data?.recipientEmail
        });
        setPurchaseConfirmed(true);
        break;

      case 'GIFTCARD_CLOSE':
        console.log('[GIFT CARDS] Close requested');
        navigate('/');
        break;

      case 'REDIRECT_TO_PAYMENT':
        // Handle Stripe payment redirect from embedded iframe
        // Stripe blocks embedding in iframes, so we need to redirect the main window
        console.log('[GIFT CARDS] Redirect to payment requested:', data);

        if (!data?.url) {
          console.error('[GIFT CARDS] Missing payment URL in REDIRECT_TO_PAYMENT');
          return;
        }

        // Redirect the main window to Stripe checkout
        // After payment, Stripe will redirect back to the success page
        window.location.href = data.url;
        break;
    }
  }, [navigate]);

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

  // ========== PURCHASE CONFIRMED VIEW ==========
  if (purchaseConfirmed && purchaseData) {
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
                {t('giftCardPage.confirmed')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {t('giftCardPage.thankYou')}
              </p>
            </div>

            {/* Gift Card Details Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Gift className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('giftCardPage.details')}
                </h2>
              </div>

              <div className="space-y-4">
                {purchaseData.giftCardCode && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">{t('giftCardPage.code')}</span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                      {purchaseData.giftCardCode}
                    </span>
                  </div>
                )}

                {purchaseData.recipientEmail && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">{t('giftCardPage.sentTo')}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {purchaseData.recipientEmail}
                    </span>
                  </div>
                )}

                {purchaseData.amount && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 dark:text-gray-400">{t('giftCardPage.value')}</span>
                    <span className="font-bold text-green-600 dark:text-green-400 text-lg">
                      {purchaseData.currency} {(purchaseData.amount / 100).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                <Home className="mr-2 h-5 w-5" />
                {t('common.backToHome')}
              </Button>
            </div>
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
          <p className="text-gray-700 dark:text-gray-300 font-medium">{t('giftCardPage.loadingPage')}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">{t('common.pleaseWait')}</p>
        </div>
      )}

      {/* Error State */}
      {loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-[#1a1a1a] z-10 p-6">
          <XCircle className="h-16 w-16 text-red-500 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {t('giftCardPage.loadError')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            {t('giftCardPage.loadErrorDesc')}
          </p>
          <div className="flex gap-3">
            <Button
              onClick={handleReload}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {t('common.reload')}
            </Button>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
            >
              {t('common.backToHome')}
            </Button>
          </div>
        </div>
      )}

      {/* Iframe */}
      <iframe
        ref={iframeRef}
        src={iframeUrl}
        className="w-full h-full border-0"
        title="Gift Cards"
        allow="payment"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
      />
    </div>
  );
};

export default GiftCards;
