import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Log per debug
    console.log('Request body:', body);
    console.log('ONESIGNAL_APP_ID:', process.env.ONESIGNAL_APP_ID);

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        app_id: process.env.ONESIGNAL_APP_ID,
        included_segments: ["Subscribed Users"],
        contents: {
          en: "Check-in online now available! If you haven't done it yet, go now"
        },
        name: "Check-in Reminder",
        url: "https://nva.vercel.app/check-in"
      })
    });

    const responseData = await response.json();
    console.log('OneSignal response:', responseData);

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
