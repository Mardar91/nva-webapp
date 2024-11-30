import OneSignal from 'react-onesignal';

// Helper per verificare se le notifiche sono abilitate
export const isPushNotificationsEnabled = async () => {
  try {
    const permission = await OneSignal.Notifications.permission;
    console.log('Current push notification status:', permission);
    return permission;
  } catch (error) {
    console.error('Errore verifica stato notifiche:', error);
    return false;
  }
};
