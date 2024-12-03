import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  try {
    console.log('Setting up continuous notification chain...');

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

    // Calcola il timestamp per la prossima notifica
    const nextNotificationTime = new Date(Date.now() + 5 * 60 * 1000);
    const scheduledUuid = crypto.randomUUID();

    // Crea due notifiche programmate per garantire la continuità
    const scheduledPayload = {
      app_id: process.env.ONESIGNAL_APP_ID,
      included_segments: ['All'],
      contents: {
        en: "🔔 TEST NOTIFICATION - Scheduled!"
      },
      name: "Scheduled Test Notification",
      data: {
        type: "recurring_test",
        trigger_next: true
      },
      send_after: nextNotificationTime.toISOString(),
      idempotency_key: scheduledUuid,
      priority: 10,
      ios_sound: "default",
      android_sound: "default",
      // Aggiunge un'azione diretta per la prossima notifica
      buttons: [
        {
          id: "trigger_next",
          text: "Next Notification",
          url: "https://nva.vercel.app/api/auto-recurring-notification"
        }
      ]
    };

    // Crea anche una notifica di backup programmata per 5 minuti dopo la prima programmata
    const backupTime = new Date(nextNotificationTime.getTime() + 5 * 60 * 1000);
    const backupUuid = crypto.randomUUID();
    const backupPayload = {
      ...scheduledPayload,
      send_after: backupTime.toISOString(),
      idempotency_key: backupUuid,
      contents: {
        en: "🔔 TEST NOTIFICATION - Backup Schedule!"
      }
    };

    // Invia tutte le notifiche a OneSignal
    const [immediateResponse, scheduledResponse, backupResponse] = await Promise.all([
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
      }),
      fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(backupPayload)
      })
    ]);

    const [immediateData, scheduledData, backupData] = await Promise.all([
      immediateResponse.json(),
      scheduledResponse.json(),
      backupResponse.json()
    ]);

    if (!immediateResponse.ok || !scheduledResponse.ok || !backupResponse.ok) {
      throw new Error('Failed to send notifications');
    }

    // Programma anche una richiesta HTTP di backup
    const nextRequestPayload = {
      url: 'https://nva.vercel.app/api/auto-recurring-notification',
      send_after: nextNotificationTime.toISOString(),
      external_id: scheduledUuid,
      type: "recurring_notification"
    };

    await fetch('https://onesignal.com/api/v1/notifications/action', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(nextRequestPayload)
    });

    return response.status(200).json({
      success: true,
      message: 'Continuous notification chain setup successfully',
      immediate: {
        id: immediateData.id,
        idempotencyKey: immediateUuid
      },
      scheduled: {
        id: scheduledData.id,
        idempotencyKey: scheduledUuid,
        scheduledFor: nextNotificationTime
      },
      backup: {
        id: backupData.id,
        idempotencyKey: backupUuid,
        scheduledFor: backupTime
      }
    });

  } catch (error) {
    console.error('Error in continuous notification chain:', error);
    return response.status(500).json({
      success: false,
      message: 'Failed to setup continuous notification chain',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
