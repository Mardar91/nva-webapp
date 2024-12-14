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
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error("Error parsing stored notification state:", e);
            return {
                deviceId: null,
                notificationSent: false,
                lastNotificationDate: null,
                checkInDate: null
            };
        }
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
    console.log('updateStoredNotificationState - New state saved:', newState);
};

// Verifica e aggiorna lo stato del dispositivo
const updateDeviceState = async (): Promise<void> => {
    const subscriptionStatus = await getSubscriptionStatus();
    console.log('updateDeviceState - Subscription status:', subscriptionStatus);
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
    console.log('saveCheckInDate - Date received:', date.toISOString());
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
    
    console.log('calculateNotificationTiming - CheckInDate:', checkInDate.toISOString(), 'Today:', today.toISOString(), 'Days until check-in:', daysUntilCheckIn);
    
    return {
      shouldSend: daysUntilCheckIn === 1,
      daysUntilCheckIn
    };
};

// Verifica se la notifica è già stata inviata per una data specifica
const hasNotificationBeenSent = (checkInDate: Date): boolean => {
    const state = getStoredNotificationState();

    if (!state.lastNotificationDate || !state.checkInDate) {
        return false;
    }

    const storedCheckIn = new Date(state.checkInDate);
    const isSent = (
        storedCheckIn.getTime() === checkInDate.getTime() &&
        state.notificationSent
    );
    console.log('hasNotificationBeenSent - checkInDate:', checkInDate.toISOString(), 'Stored checkIn date:', storedCheckIn.toISOString(), 'Notification sent:', isSent)
    return isSent;
};

// Resetta lo stato delle notifiche
const resetNotificationState = (): void => {
    console.log('resetNotificationState - Removing notification state.');
    localStorage.removeItem(STORAGE_KEY);
};

export {
    saveCheckInDate,
    resetNotificationState,
    hasNotificationBeenSent,
    calculateNotificationTiming,
    getStoredNotificationState,
    updateStoredNotificationState,
    type CheckInNotificationState
};
