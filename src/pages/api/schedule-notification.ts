import type { VercelRequest, VercelResponse } from '@vercel/node';

interface NotificationBody {
  checkInDate: string;
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // Abilita CORS
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { checkInDate } = request.body as NotificationBody;
    
    // Calcola la data per la notifica (1 giorno prima del check-in)
    const notificationDate = new Date(checkInDate);
    notificationDate.setDate(notificationDate.getDate() - 1);
    
    // Formatta la data per OneSignal
    const sendAfter = notificationDate.toISOString();

    const oneSignalResponse = await fetch('https://api.onesignal.com/notifications', {
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

    const data = await oneSignalResponse.json();

    if (!oneSignalResponse.ok) {
      throw new Error(data.errors?.[0] || 'Failed to schedule notification');
    }

    return response.status(200).json(data);
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return response.status(500).json({ 
      message: 'Error scheduling notification',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
