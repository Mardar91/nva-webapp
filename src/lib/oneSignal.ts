import OneSignal from 'react-onesignal';

export const initOneSignal = async () => {
  try {
    // Configurazione delle notifiche
    await OneSignal.Notifications.setDefaultUrl(window.location.origin);
    
    // Configura il prompt delle notifiche
    await OneSignal.Slidedown.promptPush({
      type: "push",
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

    console.log('OneSignal Notifications Configured');

    // Aggiungi listener per debug
    OneSignal.Notifications.addEventListener('permissionChange', (permission) => {
      console.log('Permission status changed:', permission);
    });

    OneSignal.on('subscriptionChange', function(isSubscribed) {
      console.log("OneSignal subscription changed:", isSubscribed);
    });

    OneSignal.on('notificationDisplay', function(event) {
      console.log("OneSignal notification displayed:", event);
    });

    // Verifica lo stato iniziale
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

// Helper per tagare un utente
export const tagUserForSegmentation = async (key: string, value: string) => {
  try {
    await OneSignal.User.addTag(key, value);
    console.log('Tag added successfully');
  } catch (error) {
    console.error('Error adding tag:', error);
  }
};

// Helper per inviare dati utente a OneSignal
export const setUserData = async (externalId: string, email?: string) => {
  try {
    if (email) {
      await OneSignal.User.addEmail(email);
    }
    await OneSignal.login(externalId);
    console.log('User data set successfully');
  } catch (error) {
    console.error('Error setting user data:', error);
  }
};
