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
  
  const daysUntilCheckIn = Math.ceil(
    (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  console.log('📅 Check-in reminder:', {
    checkInDate: checkInDate.toISOString(),
    daysUntil: daysUntilCheckIn,
    deviceId: config.deviceId
  });

  // ✅ MODIFICATO: Se il check-in è disponibile (entro 7 giorni), invia immediata
  if (daysUntilCheckIn >= -1 && daysUntilCheckIn <= 7) {
    try {
      console.log('🔔 Check-in already available! Sending immediate notification...');
      
      const response = await fetch('/api/check-in-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: config.deviceId,
          checkInDate: new Date().toISOString(),
          immediate: true
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log('✅ Immediate notification sent successfully');
        return {
          scheduled: true,
          sentImmediately: true,
          availableIn: 0
        };
      } else {
        console.error('❌ Error sending immediate notification:', result);
        return {
          scheduled: false,
          error: result.error || result.message
        };
      }
    } catch (error) {
      console.error('❌ API call error:', error);
      return {
        scheduled: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // ✅ MODIFICATO: Se mancano PIÙ di 7 giorni, programma per 7 giorni prima alle 9:00
  const notificationDate = new Date(checkInDate);
  notificationDate.setDate(notificationDate.getDate() - 7);
  notificationDate.setHours(9, 0, 0, 0);

  const nowWithTime = new Date();
  if (notificationDate < nowWithTime && daysUntilCheckIn > 7) {
    notificationDate.setTime(nowWithTime.getTime() + 60000);
  }

  try {
    console.log('🔔 Scheduling notification for:', notificationDate.toISOString());
    
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
      console.log('✅ Notification scheduled successfully');
      return {
        scheduled: true,
        availableIn: daysUntilCheckIn,
        sentImmediately: false
      };
    } else {
      console.error('❌ Error scheduling notification:', result);
      return {
        scheduled: false,
        error: result.error || result.message
      };
    }
  } catch (error) {
    console.error('❌ API call error:', error);
    return {
      scheduled: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const cancelCheckInReminder = async (deviceId: string): Promise<boolean> => {
  try {
    console.log('🗑️ Cancelling notification for device:', deviceId);
    return true;
  } catch (error) {
    console.error('Error cancelling notification:', error);
    return false;
  }
};
