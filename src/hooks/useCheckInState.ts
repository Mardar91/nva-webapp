import { useState, useEffect } from 'react';

export type CheckInStatus =
  | 'idle'
  | 'loading'
  | 'pending'
  | 'validated'
  | 'form_ready'
  | 'completed'
  | 'expired';

export interface CheckInState {
  status: CheckInStatus;
  bookingId?: string;
  apartmentName?: string;
  checkInDate?: string;
  checkOutDate?: string;
  numberOfGuests?: number;
  completedAt?: string;
  notificationScheduled?: boolean;
  notificationSent?: boolean;
  mode?: 'normal' | 'unassigned_checkin';
  savedEmail?: string;
  savedBookingRef?: string;
}

const STORAGE_KEY = 'nva_checkin_state';

export const useCheckInState = () => {
  const [checkInState, setCheckInState] = useState<CheckInState>(() => {
    if (typeof window === 'undefined') return { status: 'idle' };

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        
        if (parsed.status === 'completed' && parsed.checkOutDate) {
          const checkOut = new Date(parsed.checkOutDate);
          const now = new Date();
          
          if (now > checkOut) {
            return { status: 'expired' };
          }
        }
        
        return parsed;
      } catch {
        return { status: 'idle' };
      }
    }
    return { status: 'idle' };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checkInState));
  }, [checkInState]);

  const updateCheckInState = (updates: Partial<CheckInState>) => {
    setCheckInState(prev => ({ ...prev, ...updates }));
  };

  const resetCheckInState = () => {
    setCheckInState({ status: 'idle' });
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // ✅ FIX: Usa UTC per evitare problemi di timezone
  const isCheckInAvailable = (): boolean => {
    if (!checkInState.checkInDate) return false;
    const checkInDate = new Date(checkInState.checkInDate);
    const today = new Date();

    // Imposta ore a mezzanotte in UTC
    today.setUTCHours(0, 0, 0, 0);
    checkInDate.setUTCHours(0, 0, 0, 0);

    const daysUntil = Math.ceil((checkInDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    console.log('🗓️ Check-in availability:', {
      checkInDate: checkInDate.toISOString(),
      today: today.toISOString(),
      daysUntil,
      isAvailable: daysUntil >= -1 && daysUntil <= 7
    });

    // From -1 (1 day after) to 7 (7 days before)
    return daysUntil >= -1 && daysUntil <= 7;
  };

  const getDaysUntilCheckIn = (): number | null => {
    if (!checkInState.checkInDate) return null;
    const checkInDate = new Date(checkInState.checkInDate);
    const today = new Date();

    // Usa UTC
    today.setUTCHours(0, 0, 0, 0);
    checkInDate.setUTCHours(0, 0, 0, 0);

    return Math.ceil((checkInDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  return {
    checkInState,
    updateCheckInState,
    resetCheckInState,
    isCheckInAvailable: isCheckInAvailable(),
    daysUntilCheckIn: getDaysUntilCheckIn()
  };
};
