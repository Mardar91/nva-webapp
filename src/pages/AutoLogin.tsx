// ============================================
// 📱 APP: NVA (React App)
// 📄 FILE: src/pages/AutoLogin.tsx
// 🔧 PURPOSE: Handle auto-login from email link
// ============================================

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useGuestSession } from '../hooks/useGuestSession';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

type LoginStatus = 'loading' | 'success' | 'error';

const AutoLogin: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken, isLoggedIn } = useGuestSession();
  const [status, setStatus] = useState<LoginStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const processAutoLogin = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setErrorMessage('Missing authentication token');
        // Redirect to home after delay
        setTimeout(() => navigate('/', { replace: true }), 3000);
        return;
      }

      // If already logged in, just redirect
      if (isLoggedIn) {
        console.log('🔐 Already logged in, redirecting...');
        setStatus('success');
        setTimeout(() => navigate('/', { replace: true }), 1500);
        return;
      }

      console.log('🔐 Processing auto-login from email link...');

      try {
        const success = await loginWithToken(token);

        if (success) {
          console.log('✅ Auto-login from email successful');
          setStatus('success');
          // Redirect to home after brief success message
          setTimeout(() => navigate('/', { replace: true }), 1500);
        } else {
          console.warn('⚠️ Auto-login from email failed');
          setStatus('error');
          setErrorMessage('Login failed. The link may have expired.');
          setTimeout(() => navigate('/', { replace: true }), 3000);
        }
      } catch (err) {
        console.error('❌ Auto-login error:', err);
        setStatus('error');
        setErrorMessage('Connection error. Please try again.');
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
              Signing you in...
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we verify your access.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              You're now signed in. Redirecting...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Login Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {errorMessage}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Redirecting to home...
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AutoLogin;
