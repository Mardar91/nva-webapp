"use client";

import { useEffect } from "react";
import OneSignal from "react-onesignal";

export const initOneSignal = async () => {
  try {
    await OneSignal.init({
      appId: "8d05cb31-99c9-4dd2-a2a9-8e7fb838fb8a", // Sostituisci con il tuo APP_ID
      notifyButton: {
        enable: true,
        position: "bottom-right",
      },
      // Per test in localhost
      allowLocalhostAsSecureOrigin: process.env.NODE_ENV === "development",
    });

    console.log("OneSignal initialized successfully!");
  } catch (error) {
    console.error("Errore durante l'inizializzazione di OneSignal:", error);
  }
};
