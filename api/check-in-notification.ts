import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';

interface CheckInNotification {
  userId: string;
  deviceId: string;
  checkInDate: string;
  notificationSent: boolean;
}

async function sendCheckInNotification(deviceId: string) {
  try {
    const notificationPayload = {
      app_id: process.env.ONESIGNAL_APP_ID,
      include_player_ids: [deviceId], // Invia solo al dispositivo specifico
      contents: { 
        en: "Please make sure to check in online before your arrival if you haven’t already! 🏡 After completing your check-in, you’ll receive your personal access code for the apartment. 🔑" 
      },
      headings: { 
        en: "✨ Check-in Online Now Available!" 
      },
      url: "https://nva.vercel.app/check-in",
      name: `Check-in Reminder - ${new Date().toLocaleDateString()}`,
      data: {
        type: "check_in_notification",
        notification_id: `checkin-${randomUUID()}`
      },
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
    return { success: true, data: responseData };
  } catch (error) {
    console.error('Error sending check-in notification:', error);
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
      const { deviceId } = request.body;

      if (!deviceId) {
        return response.status(400).json({
          success: false,
          message: 'Device ID is required'
        });
      }

      const result = await sendCheckInNotification(deviceId);
      
      if (result.success) {
        return response.status(200).json({
          success: true,
          message: 'Check-in notification sent successfully',
          data: result.data
        });
      } else {
        return response.status(500).json({
          success: false,
          message: 'Failed to send check-in notification',
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
