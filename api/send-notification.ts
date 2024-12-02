import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface RequestBody {
  checkInDate: string;
}

async function sendOneSignalNotification() {
  try {
    const notificationData = {
      app_id: process.env.ONESIGNAL_APP_ID,
      included_segments: ['Subscribed Users'],
      contents: {
        en: "Check-in online now available! If you haven't done it yet, go now"
      },
      name: "Check-in Reminder Test",
      url: "https://nva.vercel.app/check-in",
    };

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(notificationData)
    });

    if (!response.ok) {
      throw new Error(`OneSignal API responded with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}

// Cambiato per Node 20 e App Router
export const runtime = 'edge'; // Aggiunto per ottimizzare le performance
export const dynamic = 'force-dynamic'; // Previene il caching della route

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as RequestBody;
    
    if (!body.checkInDate) {
      return new NextResponse(
        JSON.stringify({ error: 'checkInDate is required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const checkInDate = new Date(body.checkInDate);
    const today = new Date();
    
    const diffTime = checkInDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays >= 0) {
      const result = await sendOneSignalNotification();
      
      return new NextResponse(
        JSON.stringify({
          success: true,
          message: "Test notification sent",
          diffDays,
          result
        }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new NextResponse(
      JSON.stringify({
        success: false,
        message: "Date is in the past",
        diffDays
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in route handler:', error);
    return new NextResponse(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
