// ============================================
// 📱 APP: NVA (React App)
// 📄 FILE: src/components/GuestLoginModal.tsx
// 🔧 PURPOSE: Login modal for guest authentication
// ============================================

import React, { useState } from 'react';
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
import { AlertCircle, LogIn, Loader2 } from 'lucide-react';

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
  const [bookingReference, setBookingReference] = useState('');
  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Validation
    if (!bookingReference.trim()) {
      setLocalError('Please enter your booking reference');
      return;
    }
    if (!email.trim()) {
      setLocalError('Please enter your email');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setLocalError('Please enter a valid email address');
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
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-400">
            <LogIn className="h-5 w-5" />
            Access Your Booking
          </DialogTitle>
          <DialogDescription>
            {redirectToChat
              ? 'Please login to access the chat and view your messages.'
              : 'Enter your booking details to access your reservation information and chat.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {displayError && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{displayError}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="bookingRef" className="text-gray-700 dark:text-gray-300">
              Booking Reference
            </Label>
            <Input
              id="bookingRef"
              type="text"
              placeholder="e.g., BK-ABC123"
              value={bookingReference}
              onChange={(e) => setBookingReference(e.target.value.toUpperCase())}
              disabled={isLoading}
              className="uppercase"
              autoComplete="off"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              You can find this in your confirmation email
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              autoComplete="email"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              The email used for your booking
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
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
