// ============================================
// 📱 APP: NVA (React App)
// 📄 FILE: src/pages/AutoLogin.tsx
// 🔧 PURPOSE: Handle auto-login from email link
// ============================================

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGuestSession } from '../hooks/useGuestSession';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

type LoginStatus = 'loading' | 'success' | 'error';

/**
 * Validates and sanitizes the redirect parameter to prevent Open Redirect attacks.
 * Only allows internal paths that start with '/' and don't contain protocol indicators.
 *
 * @param redirect - The redirect path from URL parameter
 * @returns A safe internal path, defaults to '/' if invalid
 */
const getSafeRedirectPath = (redirect: string | null): string => {
  if (!redirect) return '/';

  // Must start with a single '/' (not '//' which could be protocol-relative URL)
  if (!redirect.startsWith('/') || redirect.startsWith('//')) {
    return '/';
  }

  // Block any attempt to include protocol or external URLs
  if (redirect.includes(':') || redirect.includes('\\')) {
    return '/';
  }

  // Block encoded characters that could bypass validation
  if (redirect.includes('%2f') || redirect.includes('%2F') ||
      redirect.includes('%5c') || redirect.includes('%5C')) {
    return '/';
  }

  return redirect;
};

const AutoLogin: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken, isLoggedIn } = useGuestSession();
  const [status, setStatus] = useState<LoginStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const processAutoLogin = async () => {
      const token = searchParams.get('token');
      const redirectParam = searchParams.get('redirect');
      const safeRedirect = getSafeRedirectPath(redirectParam);

      if (!token) {
        setStatus('error');
        setErrorMessage(t('autoLogin.missingToken'));
        // Redirect to home after delay
        setTimeout(() => navigate('/', { replace: true }), 3000);
        return;
      }

      // If already logged in, just redirect to the target page
      if (isLoggedIn) {
        console.log('🔐 Already logged in, redirecting to:', safeRedirect);
        setStatus('success');
        setTimeout(() => navigate(safeRedirect, { replace: true }), 1500);
        return;
      }

      console.log('🔐 Processing auto-login from email link...');
      console.log('🔀 Redirect target after login:', safeRedirect);

      try {
        const success = await loginWithToken(token);

        if (success) {
          console.log('✅ Auto-login from email successful');
          setStatus('success');
          // Redirect to target page after brief success message
          setTimeout(() => navigate(safeRedirect, { replace: true }), 1500);
        } else {
          console.warn('⚠️ Auto-login from email failed');
          setStatus('error');
          setErrorMessage(t('autoLogin.loginFailed'));
          setTimeout(() => navigate('/', { replace: true }), 3000);
        }
      } catch (err) {
        console.error('❌ Auto-login error:', err);
        setStatus('error');
        setErrorMessage(t('accessCodeSection.connectionError'));
        setTimeout(() => navigate('/', { replace: true }), 3000);
      }
    };

    processAutoLogin();
  }, [searchParams, loginWithToken, isLoggedIn, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="h-16 w-16 text-blue-500 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('autoLogin.signingIn')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('autoLogin.pleaseWait')}
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('autoLogin.welcome')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('autoLogin.signedIn')}
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('autoLogin.loginFailed')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {errorMessage}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              {t('autoLogin.redirecting')}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AutoLogin;
