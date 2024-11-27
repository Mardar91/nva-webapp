// src/lib/oneSignalService.ts

declare global {
  interface Window {
    OneSignal: any;
    OneSignalDeferred: any[];
  }
}

export const scheduleCheckInNotification = async (checkInDate: Date) => {
  if (typeof window !== 'undefined' && window.OneSignalDeferred) {
    try {
      // Calcola la data 3 giorni prima del check-in
      const notificationDate = new Date(checkInDate);
      notificationDate.setDate(notificationDate.getDate() - 3);

      window.OneSignalDeferred.push(async function(OneSignal: any) {
        // Richiedi il permesso per le notifiche se non è già stato dato
        const permission = await OneSignal.Notifications.permission;
        
        if (permission !== 'granted') {
          await OneSignal.Notifications.requestPermission();
        }

        // Programma la notifica
        await OneSignal.Notifications.scheduleSilent({
          title: "Check-in Available!",
          body: "Your online check-in is now available. Click here to proceed.",
          url: window.location.origin + "/check-in",
          icon: '/icons/icon-192x192.png',
          timestamp: notificationDate.getTime(),
          data: {
            checkInDate: checkInDate.toISOString()
          }
        });
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }
};
