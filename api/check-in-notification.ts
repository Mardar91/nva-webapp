import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';

interface CheckInNotification {
  deviceId: string;
  checkInDate: string;
  notificationSent: boolean;
}

async function sendCheckInNotification(deviceId: string, checkInDate: string) {
  try {
    console.log('Starting sendCheckInNotification with:', { deviceId, checkInDate });

    // Calcola quando inviare la notifica (un giorno prima del check-in alle 9:00)
    const notificationDate = new Date(checkInDate);
    notificationDate.setDate(notificationDate.getDate() - 1);
    notificationDate.setHours(9, 0, 0, 0);

    console.log('Calculated notification date:', notificationDate.toISOString());

    // Se la data di notifica è già passata, non programmare la notifica
    if (notificationDate < new Date()) {
      console.log('Notification date has already passed');
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

    console.log('Sending notification payload to OneSignal:', notificationPayload);

    // Verifica che ONESIGNAL_REST_API_KEY sia definito
    if (!process.env.ONESIGNAL_REST_API_KEY) {
      console.error('ONESIGNAL_REST_API_KEY is not defined');
      return {
        success: false,
        error: 'OneSignal API key is not configured'
      };
    }

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(notificationPayload)
    });

    const responseData = await response.json();
    console.log('OneSignal API response:', responseData);

    if (!response.ok) {
      console.error('OneSignal error response:', responseData);
      return { 
        success: false, 
        error: responseData 
      };
    }

    console.log('Notification scheduled successfully');
    return { 
      success: true, 
      data: responseData 
    };
  } catch (error) {
    console.error('Error in sendCheckInNotification:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
export default async function handler(request: VercelRequest, response: VercelResponse) {
  console.log('Starting check-in notification handler');
  
  // CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // Verifica le credenziali OneSignal
  if (!process.env.ONESIGNAL_APP_ID || !process.env.ONESIGNAL_REST_API_KEY) {
    console.error('Missing OneSignal configuration');
    return response.status(500).json({
      success: false,
      message: 'OneSignal configuration is missing'
    });
  }

  if (request.method === 'POST') {
    try {
      console.log('Processing POST request');
      const { deviceId, checkInDate } = request.body;
      
      console.log('Received request data:', { 
        deviceId: deviceId ? 'present' : 'missing', 
        checkInDate 
      });

      if (!deviceId) {
        console.error('Device ID is missing');
        return response.status(400).json({
          success: false,
          message: 'Device ID is required'
        });
      }

      if (!checkInDate) {
        console.error('Check-in date is missing');
        return response.status(400).json({
          success: false,
          message: 'Check-in date is required'
        });
      }

      // Valida il formato della data
      const dateObj = new Date(checkInDate);
      if (isNaN(dateObj.getTime())) {
        console.error('Invalid check-in date format');
        return response.status(400).json({
          success: false,
          message: 'Invalid check-in date format'
        });
      }

      console.log('Sending notification...');
      const result = await sendCheckInNotification(deviceId, checkInDate);
      console.log('Notification result:', result);

      if (result.success) {
        console.log('Notification scheduled successfully');
        return response.status(200).json({
          success: true,
          message: 'Check-in notification scheduled successfully',
          data: result.data
        });
      } else {
        console.error('Failed to schedule notification:', result.error);
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

  console.error('Invalid request method');
  return response.status(405).json({ 
    success: false,
    error: 'Method not allowed' 
  });
}
