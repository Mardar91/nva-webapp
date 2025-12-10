// ============================================
// APP: NVA (React App)
// FILE: api/checkout-reminder.ts
// PURPOSE: Schedule checkout reminder notification (1 day before checkout at 9:00 AM)
// ============================================

import type { VercelRequest, VercelResponse } from '@vercel/node';

interface CheckoutReminderRequest {
  deviceId: string;
  checkOutDate: string;
  bookingReference?: string;
}

async function scheduleCheckoutReminder(
  deviceId: string,
  checkOutDate: string,
  bookingReference: string
) {
  try {
    console.log('Scheduling checkout reminder:', { deviceId, checkOutDate, bookingReference });

    const checkOutDateTime = new Date(checkOutDate);

    // Schedule for 1 day before checkout at 9:00 AM
    const notificationDate = new Date(checkOutDateTime);
    notificationDate.setDate(notificationDate.getDate() - 1);
    notificationDate.setHours(9, 0, 0, 0);

    const now = new Date();

    // If notification date is in the past, don't schedule
    if (notificationDate <= now) {
      console.log('Checkout reminder date is in the past, not scheduling');
      return {
        success: false,
        reason: 'notification_date_passed'
      };
    }

    // Create idempotency key based on booking reference and checkout date
    const idempotencyKey = `checkout-${bookingReference}-${checkOutDate}`;

    const notificationPayload = {
      app_id: process.env.ONESIGNAL_APP_ID,
      include_player_ids: [deviceId],
      contents: {
        en: "Friendly reminder: Check-out is tomorrow by 10:00 AM. Please make sure to leave the apartment clean and return the keys as instructed. Thank you for staying with us! 🏡"
      },
      headings: {
        en: "🔔 Check-out Reminder"
      },
      url: "https://nva.vercel.app/check-in",
      name: `Checkout Reminder - ${bookingReference}`,
      data: {
        type: "checkout_reminder",
        bookingReference: bookingReference,
        checkOutDate: checkOutDate
      },
      send_after: notificationDate.toISOString(),
      timezone: "Europe/Rome",
      idempotency_key: idempotencyKey,
      priority: 10,
      ios_sound: "default",
      android_sound: "default"
    };

    console.log('OneSignal checkout reminder payload:', notificationPayload);

    if (!process.env.ONESIGNAL_REST_API_KEY) {
      console.error('ONESIGNAL_REST_API_KEY is not defined');
      return {
        success: false,
        error: 'OneSignal API key is not configured'
      };
    }

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(notificationPayload)
    });

    const responseData = await response.json();
    console.log('OneSignal checkout reminder response:', responseData);

    if (!response.ok) {
      console.error('OneSignal error:', responseData);
      return {
        success: false,
        error: responseData
      };
    }

    return {
      success: true,
      data: responseData,
      scheduledFor: notificationDate.toISOString()
    };
  } catch (error) {
    console.error('Error scheduling checkout reminder:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  // CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (!process.env.ONESIGNAL_APP_ID || !process.env.ONESIGNAL_REST_API_KEY) {
    console.error('Missing OneSignal configuration');
    return response.status(500).json({
      success: false,
      message: 'OneSignal configuration is missing'
    });
  }

  if (request.method === 'POST') {
    try {
      const { deviceId, checkOutDate, bookingReference } = request.body as CheckoutReminderRequest;

      console.log('Checkout reminder request:', {
        deviceId: deviceId ? 'present' : 'missing',
        checkOutDate,
        bookingReference
      });

      if (!deviceId) {
        return response.status(400).json({
          success: false,
          message: 'Device ID is required'
        });
      }

      if (!checkOutDate) {
        return response.status(400).json({
          success: false,
          message: 'Check-out date is required'
        });
      }

      const dateObj = new Date(checkOutDate);
      if (isNaN(dateObj.getTime())) {
        return response.status(400).json({
          success: false,
          message: 'Invalid check-out date format'
        });
      }

      const result = await scheduleCheckoutReminder(
        deviceId,
        checkOutDate,
        bookingReference || 'unknown'
      );

      if (result.success) {
        return response.status(200).json({
          success: true,
          message: 'Checkout reminder scheduled successfully',
          scheduledFor: result.scheduledFor,
          data: result.data
        });
      } else {
        return response.status(result.reason === 'notification_date_passed' ? 200 : 500).json({
          success: false,
          message: result.reason === 'notification_date_passed'
            ? 'Checkout date is too soon to schedule reminder'
            : 'Failed to schedule checkout reminder',
          error: result.error
        });
      }
    } catch (error) {
      console.error('Error in checkout reminder handler:', error);
      return response.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return response.status(405).json({
    success: false,
    error: 'Method not allowed'
  });
}
