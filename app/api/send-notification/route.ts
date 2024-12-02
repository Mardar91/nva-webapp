// app/api/send-notification/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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
      // Aggiungi send_after solo se c'è una data pianificata
      ...(scheduleDate && !immediate ? { send_after: scheduleDate } : {}),
      // Parametri aggiuntivi come da documentazione
      isAnyWeb: true,
      isChromeWeb: true,
      isFirefox: true,
      isSafari: true,
      chrome_web_icon: "https://nva.vercel.app/icons/icon-192x192.png",
      firefox_icon: "https://nva.vercel.app/icons/icon-192x192.png"
    };

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(notificationData)
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('OneSignal API Error:', responseData);
      throw new Error(JSON.stringify(responseData));
    }

    return NextResponse.json({ 
      success: true, 
      data: responseData,
      scheduled: scheduleDate && !immediate ? scheduleDate : 'immediate'
    });
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
