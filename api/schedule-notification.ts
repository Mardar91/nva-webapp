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

    // Se mancano più di 24 ore, schedula la notifica per quando mancheranno esattamente 24 ore
    // Altrimenti, se mancano tra 24 e 0 ore, invia la notifica immediatamente
    const sendAfter = hoursDifference > 24 
      ? new Date(checkInDate.getTime() - (24 * 60 * 60 * 1000)).toISOString()
      : new Date().toISOString();

    console.log('Scheduling notification for:', sendAfter);

    const oneSignalResponse = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        app_id: process.env.ONESIGNAL_APP_ID,
        included_segments: ['Subscribed Users'],
        send_after: sendAfter,
        contents: {
          en: "Check-in online now available! If you haven't done it, go now."
        },
        name: "Check-in Reminder",
        data: {
          type: "check_in_reminder",
          checkInDate: date
        }
      })
    });

    const data = await oneSignalResponse.json();
    console.log('OneSignal API Response:', data);

    if (!oneSignalResponse.ok) {
      throw new Error(data.errors?.[0] || 'Failed to schedule notification');
    }

    return response.status(200).json({
      success: true,
      message: 'Notification scheduled successfully',
      scheduledFor: sendAfter,
      hoursUntilCheckIn: hoursDifference,
      oneSignalResponse: data
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
