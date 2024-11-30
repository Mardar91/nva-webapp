import OneSignal from 'react-onesignal';

export const initOneSignal = async () => {
  try {
    await OneSignal.init({
      appId: "8d05cb31-99c9-4dd2-a2a9-8e7fb838fb8a",
      allowLocalhostAsSecureOrigin: process.env.NODE_ENV === 'development',
      notifyButton: {
        enable: true,
        size: 'medium',
        theme: 'default',
        position: 'bottom-right',
        showCredit: false,
        text: {
          'tip.state.unsubscribed': 'Ricevi notifiche',
          'tip.state.subscribed': 'Notifiche abilitate',
          'tip.state.blocked': 'Notifiche bloccate',
          'message.prenotify': 'Clicca per ricevere notifiche',
          'message.action.subscribed': 'Grazie per aver attivato le notifiche!',
          'message.action.resubscribed': 'Notifiche riattivate',
          'message.action.unsubscribed': 'Non riceverai più notifiche',
          'dialog.main.title': 'Gestisci Notifiche',
          'dialog.main.button.subscribe': 'ATTIVA',
          'dialog.main.button.unsubscribe': 'DISATTIVA',
          'dialog.blocked.title': 'Sblocca Notifiche',
          'dialog.blocked.message': 'Segui le istruzioni per abilitare le notifiche'
        }
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
