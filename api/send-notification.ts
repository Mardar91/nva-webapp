import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { scheduleDate, immediate, checkInDate } = request.body;
    console.log('Received request:', { scheduleDate, immediate, checkInDate });

    // Costruzione della notifica secondo la documentazione ufficiale
    const notificationData = {
      app_id: process.env.ONESIGNAL_APP_ID,
      included_segments: ["Subscribed Users"],
      contents: {
        en: "Check-in online now available! If you haven't done it yet, go now"
      },
      headings: {
        en: "Check-in Reminder"
      },
      url: "https://nva.vercel.app/check-in",
      web_push_topic: "check-in-reminder",
      // Delivery timing
      delayed_option: scheduleDate && !immediate ? "timezone" : undefined,
      delivery_time_of_day: scheduleDate && !immediate ? scheduleDate : undefined,
      // Web-specific settings
      web_buttons: [
        {
          id: "check-in-now",
          text: "Check-in Now",
          url: "https://nva.vercel.app/check-in"
        }
      ],
      // Platform targeting
      isAnyWeb: true,
      chrome_web_icon: "https://nva.vercel.app/icons/icon-192x192.png",
      firefox_icon: "https://nva.vercel.app/icons/icon-192x192.png"
    };

    console.log('Sending notification to OneSignal:', notificationData);

    const oneSignalResponse = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(notificationData)
    });

    const responseData = await oneSignalResponse.json();
    console.log('OneSignal response:', responseData);

    if (!oneSignalResponse.ok) {
      throw new Error(JSON.stringify(responseData));
    }

    return response.status(200).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Error sending notification:', error);
    return response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
