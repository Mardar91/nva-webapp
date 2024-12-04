// hooks/useNotifications.ts

import { useState, useEffect, useCallback } from 'react';
import {
  getDeviceId,
  getSubscriptionStatus,
  requestNotificationPermission,
  isOneSignalAvailable
} from '../lib/notifications/oneSignal';
import {
  initializeCheckInNotifications,
  saveCheckInDate,
  checkAndSendNotification,
  getStoredNotificationState,
  calculateNotificationTiming,
  type CheckInNotificationState
} from '../lib/notifications/checkInNotifications';
import type { NotificationPayload } from '../types/notifications';

interface UseNotificationsReturn {
  isSupported: boolean;
  isSubscribed: boolean;
  deviceId: string | null;
  notificationState: CheckInNotificationState;
  daysUntilCheckIn: number | null;
  requestPermission: () => Promise<boolean>;
  setCheckInDate: (date: Date) => Promise<void>;
  hasNotificationPermission: boolean;
  error: string | null;
}

export const useNotifications = (checkInDate?: Date | null): UseNotificationsReturn => {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [daysUntilCheckIn, setDaysUntilCheckIn] = useState<number | null>(null);
  const [notificationState, setNotificationState] = useState<CheckInNotificationState>(
    getStoredNotificationState()
  );
  const [hasNotificationPermission, setHasNotificationPermission] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Verifica il supporto delle notifiche
  useEffect(() => {
    const checkSupport = async () => {
      if (isOneSignalAvailable()) {
        setIsSupported(await window.OneSignal.Notifications.isPushSupported());
      }
    };
    checkSupport();
  }, []);

  // Inizializza le notifiche e monitora lo stato
  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeCheckInNotifications();
        
        // Verifica lo stato di sottoscrizione
        const status = await getSubscriptionStatus();
        if (status) {
          setIsSubscribed(status.isSubscribed);
          setDeviceId(status.deviceId);
          setHasNotificationPermission(!!status.pushToken);
        }
        
        // Configura i listener per gli eventi OneSignal
        if (isOneSignalAvailable()) {
  window.OneSignal.Notifications.addEventListener('permissionChange', (permission: boolean) => {
    setHasNotificationPermission(permission);
  });
}
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize notifications');
      }
    };

    if (isSupported) {
      initialize();
    }
  }, [isSupported]);

  // Monitora il countdown per il check-in
  useEffect(() => {
    if (checkInDate) {
      const updateCountdown = () => {
        const { shouldSend, daysUntilCheckIn } = calculateNotificationTiming(checkInDate);
        setDaysUntilCheckIn(daysUntilCheckIn);

        // Se è il momento giusto e siamo sottoscritti, invia la notifica
        if (shouldSend && isSubscribed && deviceId) {
          checkAndSendNotification();
        }
      };

      updateCountdown();
      
      // Aggiorna il countdown ogni ora
      const intervalId = setInterval(updateCountdown, 60 * 60 * 1000);
      
      return () => clearInterval(intervalId);
    }
  }, [checkInDate, isSubscribed, deviceId]);

  // Richiedi i permessi per le notifiche
  const requestPermission = useCallback(async () => {
    try {
      const granted = await requestNotificationPermission();
      setHasNotificationPermission(granted);
      return granted;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request notification permission');
      return false;
    }
  }, []);

  // Imposta la data del check-in e aggiorna lo stato
  const setCheckInDate = useCallback(async (date: Date) => {
    try {
      saveCheckInDate(date);
      const newState = getStoredNotificationState();
      setNotificationState(newState);
      
      const { daysUntilCheckIn: days } = calculateNotificationTiming(date);
      setDaysUntilCheckIn(days);

      // Se manca un giorno e siamo sottoscritti, verifica se inviare la notifica
      if (days === 1 && isSubscribed && deviceId) {
        await checkAndSendNotification();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set check-in date');
    }
  }, [isSubscribed, deviceId]);

  return {
    isSupported,
    isSubscribed,
    deviceId,
    notificationState,
    daysUntilCheckIn,
    requestPermission,
    setCheckInDate,
    hasNotificationPermission,
    error
  };
};

export default useNotifications;
