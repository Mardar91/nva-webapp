import { CHECKIN_CONFIG } from '../config/checkin';

interface ReminderConfig {
  checkInDate: string;
  deviceId: string;
  bookingReference?: string;
}

interface ReminderResult {
  scheduled: boolean;
  availableIn?: number;
  error?: any;
  reason?: string;
  sentImmediately?: boolean;
}

export const scheduleCheckInReminder = async (
  config: ReminderConfig
): Promise<ReminderResult> => {
  const checkInDate = new Date(config.checkInDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  checkInDate.setHours(0, 0, 0, 0);
  
  // Calcola giorni mancanti
  const daysUntilCheckIn = Math.ceil(
    (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  console.log('📅 Check-in reminder:', {
    checkInDate: checkInDate.toISOString(),
    daysUntil: daysUntilCheckIn,
    deviceId: config.deviceId
  });

  // ✅ Se il check-in è GIÀ DISPONIBILE (entro 3 giorni), invia notifica immediata
  if (daysUntilCheckIn >= -1 && daysUntilCheckIn <= 3) {
    try {
      console.log('🔔 Check-in già disponibile! Invio notifica immediata...');
      
      const response = await fetch('/api/check-in-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: config.deviceId,
          checkInDate: new Date().toISOString(), // ✅ IMMEDIATA
          immediate: true
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log('✅ Notifica immediata inviata con successo');
        return {
          scheduled: true,
          sentImmediately: true,
          availableIn: 0
        };
      } else {
        console.error('❌ Errore invio notifica immediata:', result);
        return {
          scheduled: false,
          error: result.error || result.message
        };
      }
    } catch (error) {
      console.error('❌ Errore chiamata API notifica immediata:', error);
      return {
        scheduled: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // ✅ Se mancano PIÙ di 3 giorni, programma per 3 giorni prima alle 9:00
  const notificationDate = new Date(checkInDate);
  notificationDate.setDate(notificationDate.getDate() - 3);
  notificationDate.setHours(9, 0, 0, 0);

  // ✅ Se la data di notifica è già passata ma il check-in non è ancora disponibile
  // (caso raro), invia comunque notifica ora
  const nowWithTime = new Date();
  if (notificationDate < nowWithTime && daysUntilCheckIn > 3) {
    notificationDate.setTime(nowWithTime.getTime() + 60000); // Tra 1 minuto
  }

  try {
    console.log('🔔 Programmazione notifica per:', notificationDate.toISOString());
    
    const response = await fetch('/api/check-in-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId: config.deviceId,
        checkInDate: notificationDate.toISOString(),
        immediate: false
      })
    });

    const result = await response.json();

    if (response.ok && result.success) {
      console.log('✅ Notifica programmata con successo');
      return {
        scheduled: true,
        availableIn: daysUntilCheckIn,
        sentImmediately: false
      };
    } else {
      console.error('❌ Errore programmazione notifica:', result);
      return {
        scheduled: false,
        error: result.error || result.message
      };
    }
  } catch (error) {
    console.error('❌ Errore chiamata API notifica:', error);
    return {
      scheduled: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Cancella notifica programmata
export const cancelCheckInReminder = async (deviceId: string): Promise<boolean> => {
  try {
    console.log('🗑️ Cancellazione notifica per device:', deviceId);
    // Implementa se OneSignal supporta cancellazione notifiche programmate
    return true;
  } catch (error) {
    console.error('Errore cancellazione notifica:', error);
    return false;
  }
};
