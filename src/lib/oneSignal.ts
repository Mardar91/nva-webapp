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

    // Verifica lo stato delle notifiche
    const subscriptionStatus = await OneSignal.User.isSubscribed();
    console.log("Stato sottoscrizione notifiche:", subscriptionStatus);

    if (!subscriptionStatus) {
      await OneSignal.Slidedown.open();
    }
  } catch (error) {
    console.error("Errore durante l'inizializzazione di OneSignal:", error);
  }
};
