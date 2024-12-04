import type { VercelRequest, VercelResponse } from '@vercel/node';

interface HolidayNotification {
  title: string;
  message: string;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

const ALL_NOTIFICATIONS: HolidayNotification[] = [
  // Notifiche festività
  {
    title: "🎁 Merry Christmas from Nonna Vittoria Apartments!",
    message: "Wishing you a joyful Christmas! 🎅✨ May your day be filled with happiness, peace, and unforgettable moments.",
    month: 12,
    day: 25,
    hour: 0,
    minute: 1
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
async function scheduleNotifications(startYear: number) {
  const scheduledNotifications = [];
  
  console.log(`Starting to schedule notifications from year ${startYear}`);
  console.log(`OneSignal App ID: ${process.env.ONESIGNAL_APP_ID ? 'Present' : 'Missing'}`);
  console.log(`OneSignal REST API Key: ${process.env.ONESIGNAL_REST_API_KEY ? 'Present' : 'Missing'}`);
  
  for (let year = startYear; year <= startYear + 5; year++) {
    for (const notification of ALL_NOTIFICATIONS) {
      const notificationDate = new Date(
        year,
        notification.month - 1,
        notification.day,
        notification.hour,
        notification.minute
      );

      console.log(`Processing notification for date: ${notificationDate.toISOString()}`);

      if (year === startYear && notificationDate.getTime() <= Date.now()) {
        console.log(`Skipping past date for: ${notification.title}`);
        continue;
      }

      const notificationPayload = {
        app_id: process.env.ONESIGNAL_APP_ID,
        included_segments: ['All'],
        contents: {
          en: notification.message
        },
        headings: {
          en: notification.title
        },
        name: `${notification.title} - ${year}`,
        data: {
          type: "scheduled_notification",
          year: year,
          notification_id: `${notification.month}-${notification.day}-${year}`
        },
        send_after: notificationDate.toISOString(),
        delayed_option: "timezone",
        idempotency_key: `${notification.month}-${notification.day}-${year}-${crypto.randomUUID()}`,
        priority: 10,
        ios_sound: "default",
        android_sound: "default"
      };

      try {
        console.log(`Sending request to OneSignal for: ${notification.title}`);
        console.log('Payload:', JSON.stringify(notificationPayload, null, 2));

        const notificationResponse = await fetch('https://onesignal.com/api/v1/notifications', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(notificationPayload)
        });

        const responseData = await notificationResponse.json();
        console.log('OneSignal Response:', {
          status: notificationResponse.status,
          statusText: notificationResponse.statusText,
          data: responseData
        });

        if (!notificationResponse.ok) {
          console.error('OneSignal error:', responseData);
          continue;
        }

        scheduledNotifications.push({
          title: notification.title,
          scheduledFor: notificationDate,
          year: year,
          response: responseData
        });

        console.log(`Successfully scheduled notification for: ${notification.title}`);
      } catch (error) {
        console.error(`Error scheduling notification for ${notification.title}:`, error);
      }
    }
  }

  console.log(`Completed scheduling. Total notifications scheduled: ${scheduledNotifications.length}`);
  return scheduledNotifications;
}

async function cancelFutureNotifications() {
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
    const now = new Date();

    for (const notification of data.notifications) {
      const notificationDate = new Date(notification.send_after);
      if (notificationDate > now) {
        await fetch(`https://onesignal.com/api/v1/notifications/${notification.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
          }
        });
      }
    }

    return true;
  } catch (error) {
    console.error('Error canceling notifications:', error);
    return false;
  }
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method === 'GET') {
    try {
      console.log('Checking scheduled notifications...');

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
      console.error('Error checking notifications:', error);
      return response.status(500).json({
        success: false,
        message: 'Failed to check notifications',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  if (request.method === 'POST') {
    try {
      console.log('Setting up notifications for next 5 years...');
      const currentYear = new Date().getFullYear();
      const scheduledNotifications = await scheduleNotifications(currentYear);

      return response.status(200).json({
        success: true,
        message: 'Notifications scheduled for next 5 years',
        totalScheduled: scheduledNotifications.length,
        notifications: scheduledNotifications.sort((a, b) => 
          new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
        )
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

  if (request.method === 'PUT') {
    try {
      console.log('Updating all future notifications...');
      
      const cancelSuccess = await cancelFutureNotifications();
      
      if (!cancelSuccess) {
        throw new Error('Failed to cancel existing notifications');
      }

      const currentYear = new Date().getFullYear();
      const scheduledNotifications = await scheduleNotifications(currentYear);

      return response.status(200).json({
        success: true,
        message: 'Notifications updated successfully',
        totalScheduled: scheduledNotifications.length,
        notifications: scheduledNotifications.sort((a, b) => 
          new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
        )
      });

    } catch (error) {
      console.error('Error updating notifications:', error);
      return response.status(500).json({
        success: false,
        message: 'Failed to update notifications',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  if (request.method === 'DELETE') {
    try {
      console.log('Deleting all scheduled notifications...');
      const cancelSuccess = await cancelFutureNotifications();
      
      return response.status(200).json({
        success: true,
        message: cancelSuccess ? 'All notifications deleted successfully' : 'No notifications to delete',
      });
    } catch (error) {
      console.error('Error deleting notifications:', error);
      return response.status(500).json({
        success: false,
        message: 'Failed to delete notifications',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
