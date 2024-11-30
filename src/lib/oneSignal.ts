import OneSignal from 'react-onesignal';

export const initOneSignal = async () => {
  try {
    await OneSignal.init({
      appId: "8d05cb31-99c9-4dd2-a2a9-8e7fb838fb8a",
      allowLocalhostAsSecureOrigin: process.env.NODE_ENV === 'development',
      serviceWorkerPath: '/OneSignalSDKWorker.js',
      notifyButton: {
        enable: false
      },
      promptOptions: {
        slidedown: {
          prompts: [
            {
              type: "push",
              autoPrompt: true,
              text: {
                actionMessage: "Vuoi ricevere notifiche su offerte e promozioni?",
                acceptButton: "SI, GRAZIE",
                cancelButton: "NO, GRAZIE"
              },
              delay: {
                pageViews: 1,
                timeDelay: 5
              }
            }
          ]
        }
      },
      welcomeNotification: {
        title: "Benvenuto!",
        message: "Grazie per esserti iscritto alle notifiche di Nonna Vittoria Apartments!",
        url: "https://nva.vercel.app"
      }
    });
    console.log('OneSignal Initialized');

    // Debug Listeners
    OneSignal.Notifications.addEventListener('permissionChange', (permission) => {
      console.log('Permission status changed:', permission);
    });

    OneSignal.User.PushSubscription.addEventListener('change', (subscription) => {
      console.log('Push subscription state:', subscription.current.optedIn);
      console.log('Full subscription data:', subscription);
    });

    // Debug Subscription Status
    const permission = await OneSignal.Notifications.permission;
    console.log('Current permission status:', permission);

    const isPushEnabled = await OneSignal.User.PushSubscription.getPushSubscription();
    console.log('Push subscription details:', isPushEnabled);
  } catch (error) {
    console.error('Errore inizializzazione OneSignal:', error);
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

// Helper per verificare lo stato completo delle sottoscrizioni
export const getSubscriptionState = async () => {
  try {
    const subscription = await OneSignal.User.PushSubscription.getPushSubscription();
    console.log('Complete subscription state:', subscription);
    return subscription;
  } catch (error) {
    console.error('Errore verifica stato sottoscrizione:', error);
    return null;
  }
};
