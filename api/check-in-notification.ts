import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';

interface CheckInNotification {
  deviceId: string;
  checkInDate: string;
  notificationSent: boolean;
}

async function sendCheckInNotification(deviceId: string, checkInDate: string) {
  try {
    // Calcola quando inviare la notifica (un giorno prima del check-in alle 9:00)
    const notificationDate = new Date(checkInDate);
    notificationDate.setDate(notificationDate.getDate() - 1);
    notificationDate.setHours(9, 0, 0, 0);

    // Se la data di notifica è già passata, non programmare la notifica
    if (notificationDate < new Date()) {
      return {
        success: false,
        error: 'Notification date has already passed'
      };
    }

    const notificationPayload = {
      app_id: process.env.ONESIGNAL_APP_ID,
      include_player_ids: [deviceId],
      contents: { 
        en: "Please make sure to check in online before your arrival if you haven't already! 🏡 After completing your check-in, you'll receive your personal access code for the apartment. 🔑" 
      },
      headings: { 
        en: "✨ Check-in Online Now Available!" 
      },
      name: `Check-in Reminder - ${notificationDate.toLocaleDateString()}`,
      data: {
        type: "check_in_notification",
        notification_id: `checkin-${randomUUID()}`
      },
      send_after: notificationDate.toISOString(),
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
    console.error('Error scheduling check-in notification:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  // CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method === 'POST') {
    try {
      const { deviceId, checkInDate } = request.body;

      if (!deviceId) {
        return response.status(400).json({
          success: false,
          message: 'Device ID is required'
        });
      }

      if (!checkInDate) {
        return response.status(400).json({
          success: false,
          message: 'Check-in date is required'
        });
      }

      const result = await sendCheckInNotification(deviceId, checkInDate);
      
      if (result.success) {
        return response.status(200).json({
          success: true,
          message: 'Check-in notification scheduled successfully',
          data: result.data
        });
      } else {
        return response.status(500).json({
          success: false,
          message: 'Failed to schedule check-in notification',
          error: result.error
        });
      }
    } catch (error) {
      console.error('Error in check-in notification handler:', error);
      return response.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return response.status(405).json({ error: 'Method not allowed' });
}
