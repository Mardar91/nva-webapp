// lib/notifications/checkInNotifications.ts

import { 
    getDeviceId, 
    getSubscriptionStatus, 
    sendCheckInNotification,
    shouldSendCheckInNotification 
  } from './oneSignal';
  
  interface CheckInNotificationState {
    deviceId: string | null;
    notificationSent: boolean;
    lastNotificationDate: string | null;
    checkInDate: string | null;
  }
  
  const STORAGE_KEY = 'check-in-notification-state';
  
  // Gestisce lo stato delle notifiche nel localStorage
  const getStoredNotificationState = (): CheckInNotificationState => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error("Error parsing stored notification state:", e);
            return {
                deviceId: null,
                notificationSent: false,
                lastNotificationDate: null,
                checkInDate: null
            };
        }
    }
    return {
      deviceId: null,
      notificationSent: false,
      lastNotificationDate: null,
      checkInDate: null
    };
  };
  
  const updateStoredNotificationState = (
    updates: Partial<CheckInNotificationState>
  ): void => {
      const currentState = getStoredNotificationState();
    const newState = { ...currentState, ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      console.log('updateStoredNotificationState - New state saved:', newState);
  };
  
  // Verifica e aggiorna lo stato del dispositivo
  const updateDeviceState = async (): Promise<void> => {
    const subscriptionStatus = await getSubscriptionStatus();
    console.log('updateDeviceState - Subscription status:', subscriptionStatus);
    if (subscriptionStatus?.deviceId) {
      const currentState = getStoredNotificationState();
      if (currentState.deviceId !== subscriptionStatus.deviceId) {
        updateStoredNotificationState({
          deviceId: subscriptionStatus.deviceId,
          notificationSent: false
        });
      }
    }
  };
  
  // Gestisce il salvataggio di una nuova data di check-in
  const saveCheckInDate = (date: Date): void => {
      console.log('saveCheckInDate - Date received:', date.toISOString());
    updateStoredNotificationState({
      checkInDate: date.toISOString(),
      notificationSent: false,
      lastNotificationDate: null
    });
  };
  
  // Calcola se è il momento di inviare una notifica
  const calculateNotificationTiming = (checkInDate: Date): {
    shouldSend: boolean;
    daysUntilCheckIn: number;
  } => {
      const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const checkIn = new Date(checkInDate);
    checkIn.setHours(0, 0, 0, 0);
    
    const diffTime = checkIn.getTime() - today.getTime();
      const daysUntilCheckIn = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
      console.log('calculateNotificationTiming - CheckInDate:', checkInDate.toISOString(), 'Today:', today.toISOString(), 'Days until check-in:', daysUntilCheckIn);
    
    return {
      shouldSend: daysUntilCheckIn === 1,
      daysUntilCheckIn
    };
  };
  
    // Verifica e invia la notifica di check-in se necessario
    const checkAndSendNotification = async (): Promise<boolean> => {
       try{
          const state = getStoredNotificationState();
          console.log('checkAndSendNotification - State:', state);
    
          if (!state.checkInDate || !state.deviceId) {
            console.log('checkAndSendNotification - Missing checkInDate or deviceId, skipping');
            return false;
          }
    
          const checkInDate = new Date(state.checkInDate);
          const shouldSend = shouldSendCheckInNotification(
            checkInDate,
            state.lastNotificationDate
          );
          console.log('checkAndSendNotification - Should send:', shouldSend);
    
          if (shouldSend) {
              try {
                console.log('checkAndSendNotification - Attempting to send notification.');
    
                const success = await sendCheckInNotification(
                  state.deviceId,
                  checkInDate
                );
                console.log('checkAndSendNotification - Notification sent success', success);
    
                if (success) {
                    updateStoredNotificationState({
                        notificationSent: true,
                        lastNotificationDate: new Date().toISOString()
                    });
                    return true;
                }
              } catch (error) {
                console.error('Error sending check-in notification:', error);
              }
            }
       } catch (error){
           console.error('checkAndSendNotification - Error during execution:', error)
       }
        
    
        return false;
      };
  
  // Resetta lo stato delle notifiche
  const resetNotificationState = (): void => {
      console.log('resetNotificationState - Removing notification state.');
    localStorage.removeItem(STORAGE_KEY);
  };
  
  // Verifica se la notifica è già stata inviata per una data specifica
  const hasNotificationBeenSent = (checkInDate: Date): boolean => {
    const state = getStoredNotificationState();
    
    if (!state.lastNotificationDate || !state.checkInDate) {
      return false;
    }
  
      const storedCheckIn = new Date(state.checkInDate);
    const isSent =  (
      storedCheckIn.getTime() === checkInDate.getTime() && 
      state.notificationSent
      );
    console.log('hasNotificationBeenSent - checkInDate:', checkInDate.toISOString(), 'Stored checkIn date:', storedCheckIn.toISOString(), 'Notification sent:', isSent)
      return isSent;
  };
  
  // Configura un intervallo per controllare periodicamente se inviare notifiche
  const setupNotificationCheck = (intervalMinutes: number = 60): () => void => {
      console.log('setupNotificationCheck - Setting up notification check with interval:', intervalMinutes, 'minutes. - before interval');
    const intervalId = setInterval(async () => {
        console.log('setupNotificationCheck - Interval tick.');
      await checkAndSendNotification();
    }, intervalMinutes * 60 * 1000);
  
    // Restituisce una funzione di cleanup
    return () => {
        console.log('setupNotificationCheck - Clearing interval.');
        clearInterval(intervalId);
    }
  };
  
    // Helper per verificare se è il momento di inviare la notifica di check-in
  const shouldSendCheckInNotification = (
      checkInDate: Date,
      lastNotificationDate: string | null
    ): boolean => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
    
        const checkIn = new Date(checkInDate);
        checkIn.setHours(0, 0, 0, 0);
    
        const diffDays = Math.floor((checkIn.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        console.log("shouldSendCheckInNotification - diffDays:", diffDays)
      
      // Verifica se è passato un giorno dall'ultima notifica
        if (lastNotificationDate) {
            const lastNotification = new Date(lastNotificationDate);
          lastNotification.setHours(0, 0, 0, 0);
          const daysSinceLastNotification = Math.floor(
            (today.getTime() - lastNotification.getTime()) / (1000 * 60 * 60 * 24)
          );
            console.log("shouldSendCheckInNotification - daysSinceLastNotification:", daysSinceLastNotification)
          if (daysSinceLastNotification < 1) return false;
        }
    
      const shouldSend = diffDays === 1;
      console.log("shouldSendCheckInNotification - shouldSend:", shouldSend)
      return shouldSend; // Invia la notifica quando manca 1 giorno al check-in
    };
  
  // Inizializza il sistema di notifiche di check-in
  const initializeCheckInNotifications = async (): Promise<void> => {
      console.log('initializeCheckInNotifications - Initializing check-in notifications.');
    await updateDeviceState();
    const cleanup = setupNotificationCheck();
    
    // Aggiungi un event listener per when the window closes/unloads
    window.addEventListener('beforeunload', cleanup);
      console.log('initializeCheckInNotifications - Initialization completed.');
  };
  
  export {
    initializeCheckInNotifications,
    saveCheckInDate,
    checkAndSendNotification,
    resetNotificationState,
    hasNotificationBeenSent,
    calculateNotificationTiming,
    getStoredNotificationState,
    updateStoredNotificationState,
    type CheckInNotificationState
  };
