import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // Abilita CORS
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Gestisce la richiesta OPTIONS per il preflight CORS
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { checkInDate } = request.body;

    // Calcola la data per la notifica (1 giorno prima del check-in)
    const notificationDate = new Date(checkInDate);
    notificationDate.setDate(notificationDate.getDate() - 1);
    
    const sendAfter = notificationDate.toISOString();

    const oneSignalResponse = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
        'Content-Type': 'application/json'
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
          checkInDate: checkInDate
        }
      })
    });

    const responseData = await oneSignalResponse.json();

    if (!oneSignalResponse.ok) {
      console.error('OneSignal API Error:', responseData);
      return response.status(500).json({ error: 'Failed to schedule notification', details: responseData });
    }

    return response.status(200).json(responseData);
  } catch (error) {
    console.error('Server error:', error);
    return response.status(500).json({ 
      error: 'Internal server error', 
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
