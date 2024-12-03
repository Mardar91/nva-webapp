import type { VercelRequest, VercelResponse } from '@vercel/node';

const FIVE_MINUTES = 5 * 60; // in secondi

export default async function handler(request: VercelRequest, response: VercelResponse) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  try {
    console.log('Setting up auto-recurring notification...');

    const uuid = crypto.randomUUID();
    const currentTime = new Date();
    const sendAfter = new Date(currentTime.getTime() + 5 * 60 * 1000).toISOString();

    const notificationPayload = {
      app_id: process.env.ONESIGNAL_APP_ID,
      included_segments: ['All'],
      contents: {
        en: "🔔 TEST NOTIFICATION - Auto-recurring test!"
      },
      name: "Auto-Recurring Test Notification",
      data: {
        type: "auto_recurring_test",
        schedule_next: true // Flag per indicare di programmare la prossima notifica
      },
      send_after: sendAfter,
      delayed_option: "timezone",
      idempotency_key: uuid,
      ttl: FIVE_MINUTES,
      priority: 10,
      ios_sound: "default",
      android_sound: "default",
      // Aggiungiamo un web_buttons per programmare la prossima notifica
      web_buttons: [{
        id: "schedule-next",
        url: `${process.env.VERCEL_URL}/api/auto-recurring-notification`,
        text: "Schedule Next"
      }]
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

    // Programma automaticamente la prossima notifica
    setTimeout(async () => {
      try {
        await fetch(`${process.env.VERCEL_URL}/api/auto-recurring-notification`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error('Error scheduling next notification:', error);
      }
    }, 4.5 * 60 * 1000); // Programma 30 secondi prima della scadenza

    return response.status(200).json({
      success: true,
      message: 'Auto-recurring notification scheduled successfully',
      oneSignalResponse: data,
      nextDelivery: sendAfter,
      idempotencyKey: uuid
    });

  } catch (error) {
    console.error('Error in auto-recurring notification:', error);
    return response.status(500).json({
      success: false,
      message: 'Failed to setup auto-recurring notification',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
