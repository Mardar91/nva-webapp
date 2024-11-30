import OneSignal from 'react-onesignal';

export const initOneSignal = async () => {
  try {
    await OneSignal.init({
      appId: "8d05cb31-99c9-4dd2-a2a9-8e7fb838fb8a",
      allowLocalhostAsSecureOrigin: process.env.NODE_ENV === 'development',
      notifyButton: {
        enable: false // Disabilita la Notification Bell
      },
      promptOptions: {
        slidedown: {
          prompts: [
            {
              type: "push",
              autoPrompt: true,
              text: {
                actionMessage: "Do you want to stay updated?",
                acceptButton: "YES, THANK YOU",
                cancelButton: "LATER"
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
  } catch (error) {
    console.error('Errore inizializzazione OneSignal:', error);
  }
};

// Helper per richiedere il permesso delle notifiche
export const requestPermission = async () => {
  try {
    return await OneSignal.Notifications.requestPermission();
  } catch (error) {
    console.error('Errore richiesta permesso:', error);
    return false;
  }
};

// Helper per verificare se le notifiche sono abilitate
export const isPushNotificationsEnabled = async () => {
  try {
    return await OneSignal.Notifications.permission;
  } catch (error) {
    console.error('Errore verifica stato notifiche:', error);
    return false;
  }
};
