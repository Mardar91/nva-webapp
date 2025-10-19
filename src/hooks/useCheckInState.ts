import { useState, useEffect } from 'react';

// ✅ AGGIUNTO STATO 'loading'
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
        
        // Verifica se il check-in è scaduto
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

  // Salva automaticamente quando cambia
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

  // ✅ CORRETTA: include 1 giorno dopo il check-in
  const isCheckInAvailable = (): boolean => {
    if (!checkInState.checkInDate) return false;
    
    const checkInDate = new Date(checkInState.checkInDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    checkInDate.setHours(0, 0, 0, 0);
    
    const daysUntil = Math.ceil((checkInDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // ✅ Da -1 (1 giorno dopo) a 3 (3 giorni prima)
    return daysUntil >= -1 && daysUntil <= 3;
  };

  const getDaysUntilCheckIn = (): number | null => {
    if (!checkInState.checkInDate) return null;
    
    const checkInDate = new Date(checkInState.checkInDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    checkInDate.setHours(0, 0, 0, 0);
    
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
