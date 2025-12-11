// ============================================
// APP: NVA (React App)
// FILE: src/components/GuestLoginModal.tsx
// PURPOSE: Login modal for guest authentication - Modern Design
// ============================================

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { AlertCircle, LogIn, Loader2, KeyRound, Mail } from 'lucide-react';

interface GuestLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (bookingReference: string, email: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  redirectToChat?: boolean;
}

const GuestLoginModal: React.FC<GuestLoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  isLoading,
  error,
  redirectToChat = false,
}) => {
  const { t } = useTranslation();
  const [bookingReference, setBookingReference] = useState('');
  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Validation
    if (!bookingReference.trim()) {
      setLocalError(t('login.errors.enterBookingRef'));
      return;
    }
    if (!email.trim()) {
      setLocalError(t('login.errors.enterEmail'));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setLocalError(t('login.errors.invalidEmail'));
      return;
    }

    const success = await onLogin(bookingReference.trim(), email.trim().toLowerCase());

    if (success) {
      // Reset form
      setBookingReference('');
      setEmail('');
      setLocalError(null);
      onClose();
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setBookingReference('');
      setEmail('');
      setLocalError(null);
      onClose();
    }
  };

  const displayError = localError || error;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center pb-2">
          {/* Icon Header */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg">
            <LogIn className="h-8 w-8 text-white" strokeWidth={1.5} />
          </div>
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
            {t('login.title')}
          </DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-400 mt-2">
            {redirectToChat
              ? t('login.descriptionChat')
              : t('login.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {displayError && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-800/50 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <p className="text-sm text-red-700 dark:text-red-300 pt-1">{displayError}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="bookingRef" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('login.bookingReference')}
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <KeyRound className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="bookingRef"
                type="text"
                placeholder={t('login.bookingRefPlaceholder')}
                value={bookingReference}
                onChange={(e) => setBookingReference(e.target.value.toUpperCase())}
                disabled={isLoading}
                className="pl-11 h-12 rounded-xl border-gray-200 dark:border-gray-700 uppercase font-medium"
                autoComplete="off"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 pl-1">
              {t('login.bookingRefHint')}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('login.emailAddress')}
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="email"
                type="email"
                placeholder={t('login.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="pl-11 h-12 rounded-xl border-gray-200 dark:border-gray-700"
                autoComplete="email"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 pl-1">
              {t('login.emailHint')}
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 h-12 rounded-xl font-semibold border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-12 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t('login.loggingIn')}
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" />
                  {t('login.loginButton')}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GuestLoginModal;
