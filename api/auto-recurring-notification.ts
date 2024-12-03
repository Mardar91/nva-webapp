import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  try {
    console.log('Setting up next 5 notifications in chain...');

    // Crea 5 notifiche programmate a intervalli di 5 minuti
    const notifications = [];
    for (let i = 0; i < 5; i++) {
      const uuid = crypto.randomUUID();
      const sendTime = new Date(Date.now() + (i * 5 * 60 * 1000));
      
      const notificationPayload = {
        app_id: process.env.ONESIGNAL_APP_ID,
        included_segments: ['All'],
        contents: {
          en: `🔔 TEST NOTIFICATION #${i + 1}`
        },
        name: `Test Notification ${i + 1}`,
        data: {
          type: "recurring_test",
          notification_number: i + 1
        },
        send_after: i === 0 ? undefined : sendTime.toISOString(),
        delayed_option: i === 0 ? "immediate" : undefined,
        idempotency_key: uuid,
        priority: 10,
        ios_sound: "default",
        android_sound: "default"
      };

      notifications.push({
        payload: notificationPayload,
        scheduledFor: i === 0 ? 'immediate' : sendTime
      });
    }

    // Invia tutte le notifiche a OneSignal
    const responses = await Promise.all(
      notifications.map(notification => 
        fetch('https://onesignal.com/api/v1/notifications', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(notification.payload)
        })
      )
    );

    // Processa tutte le risposte
    const results = await Promise.all(
      responses.map(async (response, index) => {
        const data = await response.json();
        return {
          success: response.ok,
          notification: index + 1,
          scheduledFor: notifications[index].scheduledFor,
          response: data
        };
      })
    );

    // Programma una chiamata finale per ricaricare altre 5 notifiche
    const finalNotificationTime = new Date(Date.now() + (4 * 5 * 60 * 1000)); // 20 minuti dopo
    const finalPayload = {
      app_id: process.env.ONESIGNAL_APP_ID,
      included_segments: ['All'],
      contents: {
        en: "🔄 Reloading notification chain..."
      },
      name: "Reload Chain Notification",
      send_after: finalNotificationTime.toISOString(),
      url: "https://nva.vercel.app/api/auto-recurring-notification",
      idempotency_key: crypto.randomUUID(),
      priority: 10
    };

    await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(finalPayload)
    });

    return response.status(200).json({
      success: true,
      message: 'Notification chain setup successfully',
      notifications: results,
      nextChainReload: finalNotificationTime
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
