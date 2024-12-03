import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  try {
    console.log('Setting up notifications chain...');

    // Invia notifica immediata
    const immediateUuid = crypto.randomUUID();
    const immediatePayload = {
      app_id: process.env.ONESIGNAL_APP_ID,
      included_segments: ['All'],
      contents: {
        en: "🔔 TEST NOTIFICATION - Now!"
      },
      name: "Immediate Test Notification",
      data: {
        type: "recurring_test"
      },
      delayed_option: "immediate",
      idempotency_key: immediateUuid,
      priority: 10,
      ios_sound: "default",
      android_sound: "default"
    };

    // Programma la prossima notifica per 5 minuti dopo
    const scheduledUuid = crypto.randomUUID();
    const nextNotificationTime = new Date(Date.now() + 5 * 60 * 1000);
    const scheduledPayload = {
      app_id: process.env.ONESIGNAL_APP_ID,
      included_segments: ['All'],
      contents: {
        en: "🔔 TEST NOTIFICATION - Scheduled!"
      },
      name: "Scheduled Test Notification",
      data: {
        type: "recurring_test"
      },
      send_after: nextNotificationTime.toISOString(),
      idempotency_key: scheduledUuid,
      priority: 10,
      ios_sound: "default",
      android_sound: "default",
      // Aggiungi un webhook per chiamare nuovamente questo endpoint
      web_buttons: [{
        id: "next-notification",
        url: "https://nva.vercel.app/api/auto-recurring-notification",
        text: "Next"
      }]
    };

    // Invia entrambe le notifiche a OneSignal
    const [immediateResponse, scheduledResponse] = await Promise.all([
      fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(immediatePayload)
      }),
      fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(scheduledPayload)
      })
    ]);

    const [immediateData, scheduledData] = await Promise.all([
      immediateResponse.json(),
      scheduledResponse.json()
    ]);

    if (!immediateResponse.ok || !scheduledResponse.ok) {
      throw new Error('Failed to send notifications');
    }

    return response.status(200).json({
      success: true,
      message: 'Notifications chain setup successfully',
      immediate: {
        id: immediateData.id,
        idempotencyKey: immediateUuid
      },
      scheduled: {
        id: scheduledData.id,
        idempotencyKey: scheduledUuid,
        scheduledFor: nextNotificationTime
      }
    });

  } catch (error) {
    console.error('Error in notification chain:', error);
    return response.status(500).json({
      success: false,
      message: 'Failed to setup notification chain',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
