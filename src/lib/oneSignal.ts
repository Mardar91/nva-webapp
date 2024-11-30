import OneSignal from 'react-onesignal';

export const initOneSignal = async () => {
  try {
    await OneSignal.init({
      appId: "8d05cb31-99c9-4dd2-a2a9-8e7fb838fb8a",
      allowLocalhostAsSecureOrigin: process.env.NODE_ENV === 'development',
      serviceWorkerParam: { scope: '/' },
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
      }
    });

    console.log('OneSignal Initialized');

    // Aggiungiamo più eventi di debug
    OneSignal.Notifications.addEventListener('permissionChange', (permission) => {
      console.log('Permission status changed:', permission);
    });

    OneSignal.on('subscriptionChange', function(isSubscribed) {
      console.log("OneSignal subscription changed:", isSubscribed);
    });

    OneSignal.on('notificationDisplay', function(event) {
      console.log("OneSignal notification displayed:", event);
    });

    const permission = await OneSignal.Notifications.permission;
    console.log('Current permission status:', permission);

  } catch (error) {
    console.error('Errore inizializzazione OneSignal:', error);
  }
};
