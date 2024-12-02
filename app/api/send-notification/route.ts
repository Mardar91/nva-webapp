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
      contents: {
        en: "Check-in online now available! If you haven't done it yet, go now"
      },
      name: "Check-in Reminder",
      url: "https://nva.vercel.app/check-in",
      web_push_topic: "check-in-reminder"
    };

    // Se c'è una data pianificata, aggiungi il parametro send_after
    if (scheduleDate && !immediate) {
      Object.assign(notificationData, {
        send_after: scheduleDate
      });
    }

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
      throw new Error(JSON.stringify(responseData));
    }

    return NextResponse.json({ success: true, data: responseData });
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
