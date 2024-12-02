import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Interfaccia per il corpo della richiesta
interface RequestBody {
  checkInDate: string;
}

// Funzione per inviare la notifica tramite OneSignal
async function sendOneSignalNotification(scheduledTime: string) {
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
      send_after: scheduledTime,
    })
  });

  return response.json();
}

// Handler principale dell'endpoint
export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const checkInDate = new Date(body.checkInDate);
    
    // Calcola la data per l'invio della notifica (1 giorno prima)
    const notificationDate = new Date(checkInDate);
    notificationDate.setDate(notificationDate.getDate() - 1);
    notificationDate.setHours(10, 0, 0, 0); // Imposta l'orario alle 10:00

    // Formatta la data per OneSignal
    const scheduledTime = notificationDate.toISOString();

    // Invia la notifica
    const result = await sendOneSignalNotification(scheduledTime);

    return NextResponse.json({
      success: true,
      scheduledTime,
      result
    });
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to schedule notification' },
      { status: 500 }
    );
  }
}
