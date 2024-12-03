import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  try {
    console.log('Sending immediate notification and scheduling next...');

    const uuid = crypto.randomUUID();

    const notificationPayload = {
      app_id: process.env.ONESIGNAL_APP_ID,
      included_segments: ['All'],
      contents: {
        en: "🔔 TEST NOTIFICATION - Auto-recurring test!"
      },
      name: "Auto-Recurring Test Notification",
      data: {
        type: "auto_recurring_test"
      },
      // Manteniamo l'invio immediato come nel vecchio codice
      delayed_option: "immediate",
      idempotency_key: uuid,
      priority: 10,
      ios_sound: "default",
      android_sound: "default"
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

    // Programma la prossima notifica tra 5 minuti
    setTimeout(async () => {
      try {
        await fetch('https://nva.vercel.app/api/auto-recurring-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error('Error scheduling next notification:', error);
      }
    }, 5 * 60 * 1000); // 5 minuti in millisecondi

    return response.status(200).json({
      success: true,
      message: 'Notification sent and next one scheduled',
      oneSignalResponse: data,
      nextScheduledIn: '5 minutes',
      idempotencyKey: uuid
    });

  } catch (error) {
    console.error('Error in auto-recurring notification:', error);
    return response.status(500).json({
      success: false,
      message: 'Failed to send and schedule notification',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
