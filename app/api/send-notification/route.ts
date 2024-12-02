import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Necessario per indicare che accettiamo POST
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return new NextResponse(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const body = await req.json();
    console.log('Received request:', body); // Debug log

    // Verifica che abbiamo la data
    if (!body.checkInDate) {
      return NextResponse.json(
        { error: 'Check-in date is required' },
        { status: 400 }
      );
    }

    // Invio notifica a OneSignal
    const notificationResponse = await fetch('https://onesignal.com/api/v1/notifications', {
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

    if (!notificationResponse.ok) {
      const errorData = await notificationResponse.text();
      console.error('OneSignal error:', errorData); // Debug log
      throw new Error(`OneSignal API error: ${errorData}`);
    }

    const result = await notificationResponse.json();
    console.log('OneSignal success:', result); // Debug log

    return NextResponse.json({
      success: true,
      result
    });

  } catch (error) {
    console.error('Error in API route:', error); // Debug log
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Opzionalmente, possiamo definire quali metodi sono permessi
export const OPTIONS = async () => {
  return NextResponse.json(
    {},
    {
      headers: {
        'Allow': 'POST',
        'Access-Control-Allow-Methods': 'POST'
      }
    }
  );
};
