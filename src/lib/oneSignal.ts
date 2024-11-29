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
      serviceWorkerParam: {
        scope: '/'
      },
      serviceWorkerPath: '/OneSignalSDKWorker.js',
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

    // Verifica se le notifiche push sono abilitate
    const permission = await OneSignal.getNotificationPermission();
    console.log("Stato permesso notifiche:", permission);

    if (permission === "default" || permission === "denied") {
      await OneSignal.showSlidedownPrompt();
    }

    // Gestione degli eventi di sottoscrizione
    OneSignal.on('subscriptionChange', (isSubscribed) => {
      console.log("Stato sottoscrizione OneSignal:", isSubscribed);
    });

    // Gestione degli eventi di visualizzazione notifiche
    OneSignal.on('notificationDisplay', (event) => {
      console.log("Notifica OneSignal visualizzata:", event);
    });

  } catch (error) {
    console.error('Errore inizializzazione OneSignal:', error);
  }
};
