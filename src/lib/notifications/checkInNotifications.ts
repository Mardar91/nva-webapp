// lib/notifications/checkInNotifications.ts

import { 
  getDeviceId, 
  getSubscriptionStatus, 
  sendCheckInNotification,
  shouldSendCheckInNotification 
} from './oneSignal';

interface CheckInNotificationState {
  deviceId: string | null;
  notificationSent: boolean;
  lastNotificationDate: string | null;
  checkInDate: string | null;
}

const STORAGE_KEY = 'check-in-notification-state';

// Gestisce lo stato delle notifiche nel localStorage
const getStoredNotificationState = (): CheckInNotificationState => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    deviceId: null,
    notificationSent: false,
    lastNotificationDate: null,
    checkInDate: null
  };
};

const updateStoredNotificationState = (
  updates: Partial<CheckInNotificationState>
): void => {
  const currentState = getStoredNotificationState();
  const newState = { ...currentState, ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
};

// Verifica e aggiorna lo stato del dispositivo
const updateDeviceState = async (): Promise<void> => {
  const subscriptionStatus = await getSubscriptionStatus();
  if (subscriptionStatus?.deviceId) {
    const currentState = getStoredNotificationState();
    if (currentState.deviceId !== subscriptionStatus.deviceId) {
      updateStoredNotificationState({
        deviceId: subscriptionStatus.deviceId,
        notificationSent: false
      });
    }
  }
};

// Gestisce il salvataggio di una nuova data di check-in
const saveCheckInDate = (date: Date): void => {
  updateStoredNotificationState({
    checkInDate: date.toISOString(),
    notificationSent: false,
    lastNotificationDate: null
  });
};

// Calcola se è il momento di inviare una notifica
const calculateNotificationTiming = (checkInDate: Date): {
  shouldSend: boolean;
  daysUntilCheckIn: number;
} => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const checkIn = new Date(checkInDate);
  checkIn.setHours(0, 0, 0, 0);
  
  const diffTime = checkIn.getTime() - today.getTime();
  const daysUntilCheckIn = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return {
    shouldSend: daysUntilCheckIn === 1,
    daysUntilCheckIn
  };
};

// Verifica e invia la notifica di check-in se necessario
const checkAndSendNotification = async (): Promise<boolean> => {
  const state = getStoredNotificationState();
  
  if (!state.checkInDate || !state.deviceId) {
    return false;
  }

  const checkInDate = new Date(state.checkInDate);
  const shouldSend = shouldSendCheckInNotification(
    checkInDate,
    state.lastNotificationDate
  );

  if (shouldSend) {
    try {
      const success = await sendCheckInNotification(
        state.deviceId,
        checkInDate
      );

      if (success) {
        updateStoredNotificationState({
          notificationSent: true,
          lastNotificationDate: new Date().toISOString()
        });
        return true;
      }
    } catch (error) {
      console.error('Error sending check-in notification:', error);
    }
  }

  return false;
};

// Resetta lo stato delle notifiche
const resetNotificationState = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

// Verifica se la notifica è già stata inviata per una data specifica
const hasNotificationBeenSent = (checkInDate: Date): boolean => {
  const state = getStoredNotificationState();
  
  if (!state.lastNotificationDate || !state.checkInDate) {
    return false;
  }

  const storedCheckIn = new Date(state.checkInDate);
  return (
    storedCheckIn.getTime() === checkInDate.getTime() && 
    state.notificationSent
  );
};

// Configura un intervallo per controllare periodicamente se inviare notifiche
const setupNotificationCheck = (intervalMinutes: number = 60): () => void => {
  const intervalId = setInterval(async () => {
    await checkAndSendNotification();
  }, intervalMinutes * 60 * 1000);

  // Restituisce una funzione di cleanup
  return () => clearInterval(intervalId);
};

// Inizializza il sistema di notifiche di check-in
const initializeCheckInNotifications = async (): Promise<void> => {
  await updateDeviceState();
  const cleanup = setupNotificationCheck();
  
  // Aggiungi un event listener per when the window closes/unloads
  window.addEventListener('beforeunload', cleanup);
};

export {
  initializeCheckInNotifications,
  saveCheckInDate,
  checkAndSendNotification,
  resetNotificationState,
  hasNotificationBeenSent,
  calculateNotificationTiming,
  getStoredNotificationState,
  updateStoredNotificationState,
  type CheckInNotificationState
};
