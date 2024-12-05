import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';

interface CheckInData {
  id: string;
  deviceId: string;
  checkInDate: string;
  notificationSent: boolean;
  createdAt: string;
}

// In un'implementazione reale, questo dovrebbe essere in un database
// Per ora usiamo un Map come storage in-memory
const checkInsStorage = new Map<string, CheckInData>();

async function sendCheckInNotification(deviceId: string) {
  try {
    const notificationPayload = {
      app_id: process.env.ONESIGNAL_APP_ID,
      include_player_ids: [deviceId],
      contents: { 
        en: "Please make sure to check in online before your arrival if you haven't already! 🏡 After completing your check-in, you'll receive your personal access code for the apartment. 🔑" 
      },
      headings: { 
        en: "✨ Check-in Online Now Available!" 
      },
      name: `Check-in Reminder - ${new Date().toLocaleDateString()}`,
      data: {
        type: "check_in_notification",
        notification_id: `checkin-${randomUUID()}`
      },
      send_after: new Date().toISOString(),
      delayed_option: "timezone",
      idempotency_key: randomUUID(),
      priority: 10,
      ios_sound: "default",
      android_sound: "default"
    };

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(notificationPayload)
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('OneSignal error:', responseData);
      return { success: false, error: responseData };
    }

    return { success: true, data: responseData };
  } catch (error) {
    console.error('Error sending check-in notification:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Funzione per processare le notifiche programmate
async function processCronNotifications() {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const today = new Date().toISOString().split('T')[0];

    // Controlla tutti i check-in
    for (const checkIn of checkInsStorage.values()) {
      const checkInDate = new Date(checkIn.checkInDate);
      checkInDate.setHours(0, 0, 0, 0);

      // Se il check-in è domani e la notifica non è stata inviata oggi
      if (checkInDate.getTime() === tomorrow.getTime() && 
          !checkIn.notificationSent) {
        
        const result = await sendCheckInNotification(checkIn.deviceId);
        
        if (result.success) {
          // Aggiorna lo stato della notifica
          checkIn.notificationSent = true;
          checkInsStorage.set(checkIn.id, checkIn);
          
          console.log(`Notification sent for check-in ID: ${checkIn.id}`);
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Error processing scheduled notifications:', error);
    return false;
  }
}

async function saveCheckInData(deviceId: string, checkInDate: string): Promise<CheckInData> {
  const newCheckIn: CheckInData = {
    id: randomUUID(),
    deviceId,
    checkInDate,
    notificationSent: false,
    createdAt: new Date().toISOString()
  };

  checkInsStorage.set(newCheckIn.id, newCheckIn);
  return newCheckIn;
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  // CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // Verifica se la richiesta viene dal cron di Vercel
  const isVercelCron = request.headers['user-agent']?.includes('vercel-cron');
  
  if (isVercelCron) {
    try {
      console.log('Starting scheduled check-in notifications check...');
      const success = await processCronNotifications();
      
      return response.status(200).json({
        success: true,
        message: success ? 'Scheduled notifications processed' : 'No notifications to process'
      });
    } catch (error) {
      console.error('Error in cron job:', error);
      return response.status(500).json({
        success: false,
        message: 'Failed to process scheduled notifications',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  if (request.method === 'POST') {
    try {
      const { deviceId, checkInDate } = request.body;

      if (!deviceId || !checkInDate) {
        return response.status(400).json({
          success: false,
          message: 'Device ID and check-in date are required'
        });
      }

      // Salva i dati del check-in
      const savedCheckIn = await saveCheckInData(deviceId, checkInDate);

      // Se il check-in è domani, invia subito la notifica
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const checkInDateObj = new Date(checkInDate);
      checkInDateObj.setHours(0, 0, 0, 0);

      if (checkInDateObj.getTime() === tomorrow.getTime()) {
        const result = await sendCheckInNotification(deviceId);
        if (result.success) {
          savedCheckIn.notificationSent = true;
          checkInsStorage.set(savedCheckIn.id, savedCheckIn);
        }
      }

      return response.status(200).json({
        success: true,
        message: 'Check-in data saved successfully',
        data: savedCheckIn
      });
    } catch (error) {
      console.error('Error in check-in handler:', error);
      return response.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return response.status(405).json({ error: 'Method not allowed' });
}
