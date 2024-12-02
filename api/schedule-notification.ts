import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  try {
    const { date } = request.body;
    const checkInDate = new Date(date);
    const now = new Date();
    
    // Calcola la differenza in ore
    const hoursDifference = (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    console.log('Hours until check-in:', hoursDifference);

    // Se mancano meno di 72 ore (3 giorni), invia la notifica immediatamente
    // Se mancano più di 72 ore, schedula per quando mancheranno 24 ore
    const sendAfter = hoursDifference > 72 
      ? new Date(checkInDate.getTime() - (24 * 60 * 60 * 1000)).toISOString()
      : undefined; // undefined farà inviare la notifica immediatamente

    const notificationPayload = {
      app_id: process.env.ONESIGNAL_APP_ID,
      included_segments: ['All'],  // Cambiato da 'Subscribed Users' a 'All'
      contents: {
        en: "Check-in online now available! If you haven't done it, go now."
      },
      name: "Check-in Reminder",
      data: {
        type: "check_in_reminder",
        checkInDate: date
      }
    };

    // Aggiungi send_after solo se è definito
    if (sendAfter) {
      console.log('Scheduling notification for future:', sendAfter);
      Object.assign(notificationPayload, { send_after: sendAfter });
    } else {
      console.log('Sending notification immediately');
    }

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
      throw new Error(data.errors?.[0] || 'Failed to schedule notification');
    }

    return response.status(200).json({
      success: true,
      message: 'Notification scheduled successfully',
      scheduledFor: sendAfter || 'immediate',
      hoursUntilCheckIn: hoursDifference,
      oneSignalResponse: data,
      isImmediate: !sendAfter
    });

  } catch (error) {
    console.error('Error scheduling notification:', error);
    return response.status(500).json({
      success: false,
      message: 'Failed to schedule notification',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
