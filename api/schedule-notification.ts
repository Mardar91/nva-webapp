import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  try {
    const { date, pushToken } = request.body;

    if (!pushToken) {
      return response.status(400).json({
        success: false,
        message: 'No push token provided'
      });
    }

    const notificationPayload = {
      app_id: process.env.ONESIGNAL_APP_ID,
      include_player_ids: [pushToken],
      contents: {
        en: "Check-in online now available! If you haven't done it, go now."
      },
      headings: {
        en: "Check-in Reminder"
      },
      data: {
        type: "check_in_reminder",
        checkInDate: date
      }
    };

    console.log('Sending notification payload:', notificationPayload);

    const oneSignalResponse = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
        'Content-Type': 'application/json'
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
      message: 'Notification scheduled successfully',
      oneSignalResponse: data
    });

  } catch (error) {
    console.error('Error sending notification:', error);
    return response.status(500).json({
      success: false,
      message: 'Failed to send notification',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
