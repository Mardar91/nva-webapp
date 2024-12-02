import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface RequestBody {
  checkInDate: string;
}

async function sendOneSignalNotification() {
  try {
    console.log('Attempting to send OneSignal notification...');
    
    const notificationData = {
      app_id: process.env.ONESIGNAL_APP_ID,
      included_segments: ['Subscribed Users'],
      contents: {
        en: "Check-in online now available! If you haven't done it yet, go now"
      },
      name: "Check-in Reminder Test",
      url: "https://nva.vercel.app/check-in",
    };

    console.log('Notification payload:', notificationData);

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(notificationData)
    });

    const responseData = await response.json();
    console.log('OneSignal API Response:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    console.log('Received check-in date:', body.checkInDate);
    
    const checkInDate = new Date(body.checkInDate);
    const today = new Date();
    
    const diffTime = checkInDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    console.log('Days until check-in:', diffDays);

    // Modificato per inviare se la data è nel futuro
    if (diffDays >= 0) { // Cambiato da === 1 a >= 0
      console.log('Sending test notification for future check-in');
      const result = await sendOneSignalNotification();
      return NextResponse.json({
        success: true,
        message: "Test notification sent",
        diffDays,
        result
      });
    }

    return NextResponse.json({
      success: false,
      message: "Date is in the past",
      diffDays
    });
    
  } catch (error) {
    console.error('POST handler error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: String(error),
        message: "Failed to process request"
      },
      { status: 500 }
    );
  }
}
