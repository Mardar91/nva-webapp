import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';

interface HolidayNotification {
  title: string;
  message: string;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

const ALL_NOTIFICATIONS: HolidayNotification[] = [
  {
    title: "🎁 Merry Christmas from Nonna Vittoria Apartments!",
    message: "Wishing you a joyful Christmas! 🎅✨ May your day be filled with happiness, peace, and unforgettable moments.",
    month: 12,
    day: 6,
    hour: 10,
    minute: 35
  },
  {
    title: "🎉 Happy New Year! 🥂",
    message: "Discover Puglia this new year with Nonna Vittoria Apartments. Wishing you joy and prosperity!",
    month: 1,
    day: 1,
    hour: 0,
    minute: 1
  },
  {
    title: "Love is in the Air 💕",
    message: "Celebrate Valentine's Day in Mola di Bari with a romantic stay at Nonna Vittoria Apartments. Unforgettable moments await!",
    month: 2,
    day: 2,
    hour: 15,
    minute: 0
  },
  {
    title: "Spring Awakens 🌸",
    message: "March into spring with a visit to Mola di Bari! Explore historic landmarks and enjoy the blossoming beauty of Puglia.",
    month: 3,
    day: 15,
    hour: 13,
    minute: 0
  },
  {
    title: "Easter Escape 🐣",
    message: "Spend Easter in Mola di Bari! Special Easter celebrations and delicious regional treats await you.",
    month: 4,
    day: 11,
    hour: 16,
    minute: 0
  },
  {
    title: "May Magic 🌺",
    message: "Enjoy sunny walks and local events in Mola di Bari. Discover the magic of May with Nonna Vittoria Apartments.",
    month: 5,
    day: 1,
    hour: 12,
    minute: 0
  },
  {
    title: "Summer Vibes 🌞",
    message: "Kick off your summer at Mola di Bari. Relax by the sea and immerse yourself in the local culture!",
    month: 6,
    day: 15,
    hour: 17,
    minute: 0
  },
  {
    title: "Polpo Festival 🐙",
    message: "Don't miss the famous Octopus Festival in Mola di Bari in July! Book your stay now for this delicious event.",
    month: 7,
    day: 2,
    hour: 14,
    minute: 0
  },
  {
    title: "August Adventures 🌊",
    message: "Experience the vibrant seaside life of Mola di Bari. Special tours and events all month long!",
    month: 8,
    day: 3,
    hour: 18,
    minute: 0
  },
  {
    title: "Sacred & Profane ✨",
    message: "Join the Patronal Feast of Maria SS. Addolorata and explore Mola di Bari's historical treasures this September.",
    month: 9,
    day: 1,
    hour: 12,
    minute: 0
  },
  {
    title: "Fall into Puglia 🍂 & Halloween Fun 🎃",
    message: "Autumn is the perfect time to explore Mola di Bari's rich history and warm hospitality.",
    month: 10,
    day: 15,
    hour: 17,
    minute: 0
  },
  {
    title: "Autumn Charm 🍷",
    message: "Escape to Mola di Bari for a peaceful November retreat. Discover local wines and cozy evenings.",
    month: 11,
    day: 6,
    hour: 12,
    minute: 0
  }
];

async function scheduleNotificationsForNextMonth() {
  const scheduledNotifications = [];
  const now = new Date();
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0); // Ultimo giorno del prossimo mese
  
  console.log(`Scheduling notifications from ${now.toISOString()} to ${monthEnd.toISOString()}`);
  
  // Filtra le notifiche per il prossimo mese
  const relevantNotifications = ALL_NOTIFICATIONS.filter(notification => {
    const notificationDate = new Date(
      now.getFullYear(),
      notification.month - 1,
      notification.day
    );
    
    // Se la data è già passata quest'anno, considera l'anno prossimo
    if (notificationDate < now) {
      notificationDate.setFullYear(now.getFullYear() + 1);
    }
    
    return notificationDate <= monthEnd;
  });

  for (const notification of relevantNotifications) {
    const notificationDate = new Date(
      now.getFullYear(),
      notification.month - 1,
      notification.day,
      notification.hour,
      notification.minute
    );

    // Se la data è già passata quest'anno, programma per l'anno prossimo
    if (notificationDate < now) {
      notificationDate.setFullYear(now.getFullYear() + 1);
    }

    const notificationPayload = {
      app_id: process.env.ONESIGNAL_APP_ID,
      included_segments: ['All'],
      contents: { en: notification.message },
      headings: { en: notification.title },
      name: `${notification.title} - ${notificationDate.toLocaleDateString()}`,
      data: {
        type: "scheduled_notification",
        year: notificationDate.getFullYear(),
        notification_id: `${notification.month}-${notification.day}-${notificationDate.getFullYear()}`
      },
      send_after: notificationDate.toISOString(),
      timezone: "Europe/Rome",
      idempotency_key: randomUUID(),
      priority: 10,
      ios_sound: "default",
      android_sound: "default"
    };

    try {
      console.log(`Attempting to schedule: ${notification.title} for ${notificationDate.toISOString()}`);
      
      const notificationResponse = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationPayload)
      });

      const responseData = await notificationResponse.json();

      if (!notificationResponse.ok) {
        console.error('OneSignal error:', responseData);
        continue;
      }

      scheduledNotifications.push({
        title: notification.title,
        scheduledFor: notificationDate,
        response: responseData
      });

      console.log(`Successfully scheduled: ${notification.title} for ${notificationDate.toISOString()}`);
    } catch (error) {
      console.error(`Error scheduling notification:`, error);
    }
  }

  return scheduledNotifications;
}

async function cancelExistingScheduledNotifications() {
  try {
    const checkResponse = await fetch(
      `https://onesignal.com/api/v1/notifications?app_id=${process.env.ONESIGNAL_APP_ID}&limit=50&kind=scheduled`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await checkResponse.json();
    
    if (!checkResponse.ok) {
      throw new Error(data.errors?.[0] || 'Failed to fetch scheduled notifications');
    }

    for (const notification of data.notifications) {
      await fetch(`https://onesignal.com/api/v1/notifications/${notification.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
        }
      });
      console.log(`Cancelled notification: ${notification.id}`);
    }

    return true;
  } catch (error) {
    console.error('Error canceling notifications:', error);
    return false;
  }
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  // CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // Verifica se la richiesta viene dal cron di Vercel
  const isVercelCron = request.headers['user-agent']?.includes('vercel-cron');

  // Se è una richiesta GET dal cron di Vercel, trattala come POST
  if (isVercelCron || request.method === 'POST') {
    try {
      console.log('Starting monthly notification scheduling...');
      console.log('Request from:', isVercelCron ? 'Vercel Cron' : 'Manual POST');
      
      // Prima cancella le notifiche esistenti
      await cancelExistingScheduledNotifications();
      
      // Poi programma le nuove notifiche
      const scheduledNotifications = await scheduleNotificationsForNextMonth();

      return response.status(200).json({
        success: true,
        message: 'Notifications scheduled for next month',
        totalScheduled: scheduledNotifications.length,
        notifications: scheduledNotifications
      });
    } catch (error) {
      console.error('Error scheduling notifications:', error);
      return response.status(500).json({
        success: false,
        message: 'Failed to schedule notifications',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // GET endpoint per verificare le notifiche programmate (solo per richieste non-cron)
  if (request.method === 'GET' && !isVercelCron) {
    try {
      const checkResponse = await fetch(
        `https://onesignal.com/api/v1/notifications?app_id=${process.env.ONESIGNAL_APP_ID}&limit=50&kind=scheduled`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await checkResponse.json();

      if (!checkResponse.ok) {
        throw new Error(data.errors?.[0] || 'Failed to fetch notifications');
      }

      const scheduledNotifications = data.notifications.map((notification: any) => ({
        id: notification.id,
        title: notification.headings?.en || 'No title',
        message: notification.contents?.en || 'No message',
        scheduledFor: notification.send_after,
        status: notification.completed_at ? 'sent' : 'scheduled'
      })).sort((a: any, b: any) => 
        new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
      );

      return response.status(200).json({
        success: true,
        totalCount: data.total_count,
        notifications: scheduledNotifications
      });
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Failed to fetch notifications',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // DELETE endpoint per cancellare tutte le notifiche programmate
  if (request.method === 'DELETE') {
    try {
      const success = await cancelExistingScheduledNotifications();
      return response.status(200).json({
        success: true,
        message: success ? 'All notifications cancelled successfully' : 'No notifications to cancel'
      });
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Failed to cancel notifications',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return response.status(405).json({ error: 'Method not allowed' });
}
