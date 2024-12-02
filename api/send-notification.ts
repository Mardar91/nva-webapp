import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { scheduleDate, immediate } = request.body;
    console.log('Processing notification request:', { scheduleDate, immediate });

    const notificationData = {
      app_id: "b2d0db38-3e2a-490b-b5fa-e7de458d06ff", // Il tuo App ID che vedo dai log
      included_segments: ["Subscribed Users"],
      contents: {
        en: "Check-in online now available! If you haven't done it yet, go now"
      },
      headings: {
        en: "Check-in Reminder"
      },
      url: "https://nva.vercel.app/check-in",
      chrome_web_icon: "https://nva.vercel.app/icons/icon-192x192.png",
      firefox_icon: "https://nva.vercel.app/icons/icon-192x192.png",
      // Delivery timing
      ...(scheduleDate && !immediate ? {
        send_after: scheduleDate
      } : {}),
      // Specifiche web push
      web_push_topic: "check-in-reminder",
      web_buttons: [{
        id: "check-in-now",
        text: "Check-in Now",
        url: "https://nva.vercel.app/check-in"
      }]
    };

    console.log('Sending to OneSignal:', notificationData);

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
      console.error('OneSignal error:', responseData);
      throw new Error(JSON.stringify(responseData));
    }

    return response.status(200).json({
      success: true,
      data: responseData,
      debug: {
        notificationSent: true,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in notification handler:', error);
    return response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      debug: {
        notificationSent: false,
        timestamp: new Date().toISOString()
      }
    });
  }
}
