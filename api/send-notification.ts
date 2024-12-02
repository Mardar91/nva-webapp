import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface RequestBody {
  checkInDate: string;
}

async function sendOneSignalNotification() {
  try {
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        app_id: process.env.ONESIGNAL_APP_ID,
        included_segments: ["Subscribed Users"],
        contents: {
          en: "Check-in online now available! If you haven't done it yet, go now"
        },
        target_channel: "push"
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`OneSignal API error: ${errorData}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to send notification: ${error.message}`);
    }
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const checkInDate = new Date(body.checkInDate);
    const today = new Date();
    
    const diffTime = checkInDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Per il test, invia per qualsiasi data futura
    if (diffDays >= 0) {
      const result = await sendOneSignalNotification();
      return NextResponse.json({ success: true, result });
    }

    return NextResponse.json({ success: false, message: "Invalid date" });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
