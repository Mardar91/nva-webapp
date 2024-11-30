import OneSignal from 'react-onesignal';

export const initOneSignal = async () => {
  try {
    await OneSignal.Slidedown.promptPush({
      text: {
        actionMessage: "Vuoi ricevere notifiche su offerte e promozioni?",
        acceptButton: "SI, GRAZIE",
        cancelButton: "NO, GRAZIE"
      },
      delay: {
        pageViews: 1,
        timeDelay: 5
      }
    });

    console.log('OneSignal Prompt Configured');

    // Debug Listeners
    OneSignal.Notifications.addEventListener('permissionChange', (permission) => {
      console.log('Permission status changed:', permission);
    });

    // Log initial permission
    const permission = await OneSignal.Notifications.permission;
    console.log('Current permission status:', permission);
  } catch (error) {
    console.error('Errore configurazione OneSignal:', error);
  }
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
