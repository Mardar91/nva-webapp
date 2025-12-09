// ============================================
// 📱 APP: NVA (React App)
// 📄 FILE: api/guest-notification.ts
// 🔧 PURPOSE: Send push notification to guest when admin replies in chat
// ============================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';

interface GuestNotificationRequest {
  deviceId: string;
  bookingRef?: string;
  message?: string;
  title?: string;
}

async function sendGuestNotification(
  deviceId: string,
  title: string = 'New Message',
  message: string = 'You have received a new message from Nonna Vittoria Apartments'
) {
  try {
    console.log('Sending guest notification:', { deviceId, title, message });

    const notificationPayload = {
      app_id: process.env.ONESIGNAL_APP_ID,
      include_player_ids: [deviceId],
      contents: {
        en: message
      },
      headings: {
        en: title
      },
      url: "https://nva.vercel.app/",
      name: `Chat Message - ${new Date().toISOString()}`,
      data: {
        type: "chat_message",
        notification_id: `chat-${randomUUID()}`,
        timestamp: new Date().toISOString()
      },
      priority: 10,
      ios_sound: "default",
      android_sound: "default",
      ios_badgeType: "Increase",
      ios_badgeCount: 1
    };

    console.log('OneSignal payload:', JSON.stringify(notificationPayload, null, 2));

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(notificationPayload)
    });

    const responseData = await response.json();
    console.log('OneSignal response:', responseData);

    if (!response.ok) {
      console.error('OneSignal error:', responseData);
      return {
        success: false,
        error: responseData
      };
    }

    return {
      success: true,
      data: responseData
    };
  } catch (error) {
    console.error('Error sending guest notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  // CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (!process.env.ONESIGNAL_APP_ID || !process.env.ONESIGNAL_REST_API_KEY) {
    console.error('Missing OneSignal configuration');
    return response.status(500).json({
      success: false,
      message: 'OneSignal configuration is missing'
    });
  }

  if (request.method === 'POST') {
    try {
      const { deviceId, bookingRef, message, title } = request.body as GuestNotificationRequest;

      console.log('Guest notification request:', {
        deviceId: deviceId ? 'present' : 'missing',
        bookingRef,
        hasMessage: !!message,
        hasTitle: !!title
      });

      if (!deviceId) {
        return response.status(400).json({
          success: false,
          message: 'Device ID is required'
        });
      }

      const notificationTitle = title || 'New Message from Nonna Vittoria';
      const notificationMessage = message || 'You have received a new reply. Open the app to read it.';

      const result = await sendGuestNotification(deviceId, notificationTitle, notificationMessage);

      if (result.success) {
        return response.status(200).json({
          success: true,
          message: 'Notification sent successfully',
          data: result.data
        });
      } else {
        return response.status(500).json({
          success: false,
          message: 'Failed to send notification',
          error: result.error
        });
      }
    } catch (error) {
      console.error('Error in guest notification handler:', error);
      return response.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return response.status(405).json({
    success: false,
    error: 'Method not allowed'
  });
}
