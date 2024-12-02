import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface RequestBody {
  checkInDate: string;
}

async function sendOneSignalNotification() {
  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      app_id: process.env.ONESIGNAL_APP_ID,
      included_segments: ['Subscribed Users'],
      contents: {
        en: "Check-in online now available! If you haven't done it yet, go now"
      },
      name: "Check-in Reminder",
      url: "https://nva.vercel.app/check-in",
      // Rimuoviamo send_after per inviare subito
    })
  });

  return response.json();
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const checkInDate = new Date(body.checkInDate);
    const today = new Date();
    
    // Calcola la differenza in giorni
    const diffTime = checkInDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Se manca esattamente 1 giorno, invia la notifica
    if (diffDays === 1) {
      const result = await sendOneSignalNotification();
      return NextResponse.json({
        success: true,
        message: "Notification sent immediately",
        result
      });
    }

    return NextResponse.json({
      success: true,
      message: "No notification needed yet",
      daysUntilCheckIn: diffDays
    });
    
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
