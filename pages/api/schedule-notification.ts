import { NextApiRequest, NextApiResponse } from 'next';

interface NotificationBody {
  checkInDate: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { checkInDate } = req.body as NotificationBody;
    
    // Calcola la data per la notifica (1 giorno prima del check-in)
    const notificationDate = new Date(checkInDate);
    notificationDate.setDate(notificationDate.getDate() - 1);
    
    // Formatta la data per OneSignal
    const sendAfter = notificationDate.toISOString();

    const response = await fetch('https://api.onesignal.com/notifications', {
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

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.errors?.[0] || 'Failed to schedule notification');
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return res.status(500).json({ 
      message: 'Error scheduling notification',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
