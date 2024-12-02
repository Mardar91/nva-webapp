import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 1. Ottieni e valida i dati dalla richiesta
    const { checkInDate } = await request.json();
    if (!checkInDate) {
      return NextResponse.json({ error: 'Check-in date is required' }, { status: 400 });
    }

    // 2. Invia la notifica OneSignal
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
        }
      })
    });

    // 3. Gestisci la risposta di OneSignal
    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      result
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
