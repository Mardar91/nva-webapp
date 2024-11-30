import OneSignal from 'react-onesignal';

// Debug Listeners
export const addOneSignalListeners = () => {
  OneSignal.Notifications.addEventListener('permissionChange', (permission) => {
    console.log('Permission status changed:', permission);
  });

  // Log permission status
  OneSignal.Notifications.permission.then(permission => {
    console.log('Current permission status:', permission);
  });
};

// Helper per richiedere il permesso delle notifiche
export const requestPermission = async () => {
  try {
    const permission = await OneSignal.Notifications.requestPermission();
    console.log('Permission request result:', permission);
    return permission;
  } catch (error) {
    console.error('Errore richiesta permesso:', error);
    return false;
  }
};

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
