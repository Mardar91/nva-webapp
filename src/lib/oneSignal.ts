"use client";

import OneSignal from "react-onesignal";

export const initOneSignal = async (): Promise<void> => {
  try {
    await OneSignal.init({
      appId: "8d05cb31-99c9-4dd2-a2a9-8e7fb838fb8a", // Sostituisci con il tuo appId
      notifyButton: {
        enable: true,
      },
    });

    console.log("OneSignal initialized successfully!");

    // Mostra il prompt per abilitare le notifiche
    await OneSignal.showSlidedownPrompt();
  } catch (error) {
    console.error("Errore durante l'inizializzazione di OneSignal:", error);
  }
};
