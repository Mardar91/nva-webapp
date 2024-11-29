"use client";

import { useEffect } from "react";
import OneSignal from "react-onesignal";

export const initOneSignal = async () => {
  try {
    await OneSignal.init({
      appId: "8d05cb31-99c9-4dd2-a2a9-8e7fb838fb8a", // Il tuo appId
      notifyButton: {
        enable: true,
        position: "bottom-right",
      },
      allowLocalhostAsSecureOrigin: process.env.NODE_ENV === "development",
    });

    console.log("OneSignal initialized successfully!");

    // Mostra il prompt per abilitare le notifiche
    const isSubscribed = await OneSignal.isPushNotificationsEnabled();
    if (!isSubscribed) {
      await OneSignal.showSlidedownPrompt();
    }
  } catch (error) {
    console.error("Errore durante l'inizializzazione di OneSignal:", error);
  }
};
