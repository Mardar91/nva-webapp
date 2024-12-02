// api/send-notification.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = request.body;
    console.log('Received request body:', body);

    const { scheduleDate, immediate, checkInDate } = body;

    const notificationData = {
      app_id: process.env.ONESIGNAL_APP_ID,
      included_segments: ["Subscribed Users"],
      target_channel: "push",
      contents: {
        en: "Check-in online now available! If you haven't done it yet, go now"
      },
      name: "Check-in Reminder",
      url: "https://nva.vercel.app/check-in",
      web_push_topic: "check-in-reminder",
      ...(scheduleDate && !immediate ? { send_after: scheduleDate } : {}),
      isAnyWeb: true,
      isChromeWeb: true,
      isFirefox: true,
      isSafari: true,
      chrome_web_icon: "https://nva.vercel.app/icons/icon-192x192.png",
      firefox_icon: "https://nva.vercel.app/icons/icon-192x192.png"
    };

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
    console.log('OneSignal API response:', responseData);

    if (!oneSignalResponse.ok) {
      console.error('OneSignal API Error:', responseData);
      return response.status(400).json(responseData);
    }

    return response.status(200).json({ 
      success: true, 
      data: responseData,
      scheduled: scheduleDate && !immediate ? scheduleDate : 'immediate'
    });
  } catch (error) {
    console.error('Error in API route:', error);
    return response.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
