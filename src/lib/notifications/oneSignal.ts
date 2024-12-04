// lib/notifications/oneSignal.ts

// Tipi per le notifiche
interface NotificationPayload {
  title: string;
  message: string;
  url?: string;
  data?: Record<string, any>;
}

interface DeviceInfo {
  deviceId: string;
  pushToken?: string;
  isSubscribed: boolean;
}

// Configurazione centralizzata
const ONE_SIGNAL_CONFIG = {
  appId: "b2d0db38-3e2a-490b-b5fa-e7de458d06ff", // Il tuo App ID
  defaultUrl: "https://nva.vercel.app",
  defaultTitle: "Nonna Vittoria Apartments",
};

// Utility per verificare se OneSignal è inizializzato e disponibile
const isOneSignalAvailable = (): boolean => {
  return typeof window !== 'undefined' && !!window.OneSignal;
};

// Ottieni l'ID del dispositivo corrente
const getDeviceId = async (): Promise<string | null> => {
  if (!isOneSignalAvailable()) return null;
  
  try {
    const deviceId = await window.OneSignal.User.PushSubscription.id;
    return deviceId || null;
  } catch (error) {
    console.error('Error getting device ID:', error);
    return null;
  }
};

// Verifica lo stato di sottoscrizione del dispositivo
const getSubscriptionStatus = async (): Promise<DeviceInfo | null> => {
  if (!isOneSignalAvailable()) return null;

  try {
    const deviceId = await getDeviceId();
    if (!deviceId) return null;

    const isSubscribed = await window.OneSignal.User.PushSubscription.optedIn;
    const pushToken = await window.OneSignal.User.PushSubscription.token;

    return {
      deviceId,
      pushToken: pushToken || undefined,
      isSubscribed
    };
  } catch (error) {
    console.error('Error getting subscription status:', error);
    return null;
  }
};

// Richiedi i permessi per le notifiche
const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isOneSignalAvailable()) return false;

  try {
    await window.OneSignal.Notifications.requestPermission();
    return true;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

// Invia una notifica specifica per il check-in
const sendCheckInNotification = async (
  deviceId: string,
  checkInDate: Date
): Promise<boolean> => {
  try {
    const response = await fetch('/api/check-in-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deviceId,
        checkInDate: checkInDate.toISOString()
      })
    });

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error sending check-in notification:', error);
    return false;
  }
};

// Gestisci l'opt-out dalle notifiche
const optOutFromNotifications = async (): Promise<boolean> => {
  if (!isOneSignalAvailable()) return false;

  try {
    await window.OneSignal.User.PushSubscription.optOut();
    return true;
  } catch (error) {
    console.error('Error opting out from notifications:', error);
    return false;
  }
};

// Gestisci l'opt-in alle notifiche
const optInToNotifications = async (): Promise<boolean> => {
  if (!isOneSignalAvailable()) return false;

  try {
    await window.OneSignal.User.PushSubscription.optIn();
    return true;
  } catch (error) {
    console.error('Error opting in to notifications:', error);
    return false;
  }
};

// Helper per verificare se è il momento di inviare la notifica di check-in
const shouldSendCheckInNotification = (
  checkInDate: Date,
  lastNotificationDate: string | null
): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const checkIn = new Date(checkInDate);
  checkIn.setHours(0, 0, 0, 0);
  
  const diffDays = Math.floor((checkIn.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  // Verifica se è passato un giorno dall'ultima notifica
  if (lastNotificationDate) {
    const lastNotification = new Date(lastNotificationDate);
    lastNotification.setHours(0, 0, 0, 0);
    const daysSinceLastNotification = Math.floor(
      (today.getTime() - lastNotification.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceLastNotification < 1) return false;
  }
  
  return diffDays === 1; // Invia la notifica quando manca 1 giorno al check-in
};

// Esporta tutte le funzioni e configurazioni
export {
  ONE_SIGNAL_CONFIG,
  isOneSignalAvailable,
  getDeviceId,
  getSubscriptionStatus,
  requestNotificationPermission,
  sendCheckInNotification,
  optOutFromNotifications,
  optInToNotifications,
  shouldSendCheckInNotification,
  type NotificationPayload,
  type DeviceInfo
};
