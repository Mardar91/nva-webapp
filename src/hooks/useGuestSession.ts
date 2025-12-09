// ============================================
// 📱 APP: NVA (React App)
// 📄 FILE: src/hooks/useGuestSession.ts
// 🔧 PURPOSE: Manage guest JWT session and booking data
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { GuestBooking, authenticateGuest, fetchBookingInfo } from '../lib/guestApi';

const STORAGE_KEY = 'nva_guest_session';

interface GuestSession {
  token: string;
  booking: GuestBooking;
  loginAt: string;
}

interface UseGuestSessionReturn {
  isLoggedIn: boolean;
  isLoading: boolean;
  token: string | null;
  booking: GuestBooking | null;
  guestName: string | null;
  error: string | null;
  login: (bookingReference: string, email: string, deviceId?: string | null) => Promise<boolean>;
  logout: () => void;
  refreshSession: () => Promise<boolean>;
}

/**
 * Check if token is expired based on checkout date + 1 day
 */
const isSessionExpired = (booking: GuestBooking): boolean => {
  if (!booking.checkOut) return false;

  const checkOutDate = new Date(booking.checkOut);
  const expiryDate = new Date(checkOutDate);
  expiryDate.setDate(expiryDate.getDate() + 1); // checkout + 1 day

  return new Date() > expiryDate;
};

/**
 * Load session from localStorage
 */
const loadSession = (): GuestSession | null => {
  if (typeof window === 'undefined') return null;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;

    const session: GuestSession = JSON.parse(saved);

    // Check if session is expired
    if (session.booking && isSessionExpired(session.booking)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return session;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

/**
 * Save session to localStorage
 */
const saveSession = (token: string, booking: GuestBooking): void => {
  if (typeof window === 'undefined') return;

  const session: GuestSession = {
    token,
    booking,
    loginAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
};

/**
 * Clear session from localStorage
 */
const clearSession = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
};

export const useGuestSession = (): UseGuestSessionReturn => {
  const [session, setSession] = useState<GuestSession | null>(() => loadSession());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check session expiry on mount and periodically
  useEffect(() => {
    if (session?.booking && isSessionExpired(session.booking)) {
      clearSession();
      setSession(null);
    }

    // Check every minute
    const interval = setInterval(() => {
      if (session?.booking && isSessionExpired(session.booking)) {
        clearSession();
        setSession(null);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [session]);

  /**
   * Login with booking reference and email
   * Optionally sends deviceId for push notifications
   */
  const login = useCallback(async (
    bookingReference: string,
    email: string,
    deviceId?: string | null
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await authenticateGuest(bookingReference, email, deviceId);

      if (result.success && result.token && result.booking) {
        saveSession(result.token, result.booking);
        setSession({
          token: result.token,
          booking: result.booking,
          loginAt: new Date().toISOString(),
        });
        return true;
      } else {
        setError(result.error || 'Login failed');
        return false;
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout and clear session
   */
  const logout = useCallback(() => {
    clearSession();
    setSession(null);
    setError(null);
  }, []);

  /**
   * Refresh session by fetching latest booking info
   */
  const refreshSession = useCallback(async (): Promise<boolean> => {
    if (!session?.token) return false;

    setIsLoading(true);

    try {
      const result = await fetchBookingInfo(session.token);

      if (result.success && result.booking) {
        saveSession(session.token, result.booking);
        setSession(prev => prev ? {
          ...prev,
          booking: result.booking!,
        } : null);
        return true;
      } else {
        // Token might be invalid, logout
        if (result.error?.includes('expired') || result.error?.includes('401')) {
          logout();
        }
        return false;
      }
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [session?.token, logout]);

  // Extract first name from full name for display
  const guestName = session?.booking?.guestName
    ? session.booking.guestName.split(' ')[0]
    : null;

  return {
    isLoggedIn: !!session?.token,
    isLoading,
    token: session?.token || null,
    booking: session?.booking || null,
    guestName,
    error,
    login,
    logout,
    refreshSession,
  };
};
