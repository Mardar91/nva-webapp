import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  try {
    const { playerId } = request.body;
    console.log('Attempting to send notification to player:', playerId);

    if (!playerId) {
      console.log('No player ID provided, falling back to all segments');
      const notificationPayload = {
        app_id: process.env.ONESIGNAL_APP_ID,
        included_segments: ['All'],
        contents: {
          en: "🔔 TEST NOTIFICATION - Check-in online now available!"
        },
        name: "Test Check-in Reminder",
        data: {
          type: "test_check_in_reminder"
        },
        delayed_option: "immediate",
        ios_sound: "default",
        android_sound: "default",
        priority: 10
      };

      console.log('Sending notification with payload:', notificationPayload);
      const oneSignalResponse = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(notificationPayload)
      });

      const data = await oneSignalResponse.json();
      console.log('OneSignal API Response:', data);

      if (!oneSignalResponse.ok) {
        console.error('OneSignal error:', data);
        throw new Error(data.errors?.[0] || 'Failed to send notification');
      }

      return response.status(200).json({
        success: true,
        message: 'Test notification sent to all segments',
        oneSignalResponse: data,
        isImmediate: true,
        testMode: true
      });
    }

    // Se abbiamo un playerId, inviamo solo a quel dispositivo
    const notificationPayload = {
      app_id: process.env.ONESIGNAL_APP_ID,
      include_player_ids: [playerId],
      contents: {
        en: "🔔 TEST NOTIFICATION - Check-in online now available!"
      },
      name: "Test Check-in Reminder",
      data: {
        type: "test_check_in_reminder"
      },
      delayed_option: "immediate",
      ios_sound: "default",
      android_sound: "default",
      priority: 10
    };

    console.log('Sending notification with payload:', notificationPayload);
    const oneSignalResponse = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(notificationPayload)
    });

    const data = await oneSignalResponse.json();
    console.log('OneSignal API Response:', data);

    if (!oneSignalResponse.ok) {
      console.error('OneSignal error:', data);
      throw new Error(data.errors?.[0] || 'Failed to send notification');
    }

    return response.status(200).json({
      success: true,
      message: 'Test notification sent to specific device',
      oneSignalResponse: data,
      isImmediate: true,
      testMode: true
    });

  } catch (error) {
    console.error('Error sending test notification:', error);
    return response.status(500).json({
      success: false,
      message: 'Failed to send test notification',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
