// ============================================
// 📱 APP: NVA (React App)
// 📄 FILE: src/lib/guestApi.ts
// 🔧 PURPOSE: API functions for guest authentication and chat
// ============================================

const CHANNEL_MANAGER_URL = 'https://book.nonnavittoriaapartments.it';

export interface GuestBooking {
  id: string;
  bookingReference: string;
  guestName: string;
  guestEmail: string;
  apartmentName: string;
  checkIn: string;
  checkOut: string;
  numberOfGuests: number;
  status: string;
}

export interface GuestAuthResponse {
  success: boolean;
  token?: string;
  booking?: GuestBooking;
  error?: string;
}

export interface ChatMessage {
  id: string;
  type: 'email' | 'chat';
  senderType: 'admin' | 'guest' | 'system';
  senderName: string;
  subject?: string;
  message: string;
  previewText?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ChatMessagesResponse {
  success: boolean;
  messages?: ChatMessage[];
  error?: string;
}

export interface SendMessageResponse {
  success: boolean;
  message?: ChatMessage;
  error?: string;
}

/**
 * Authenticate guest with booking reference and email
 * Optionally sends deviceId for push notifications
 */
export const authenticateGuest = async (
  bookingReference: string,
  email: string,
  deviceId?: string | null
): Promise<GuestAuthResponse> => {
  try {
    const response = await fetch(`${CHANNEL_MANAGER_URL}/api/public/chat/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bookingReference,
        email,
        ...(deviceId && { deviceId })  // Include deviceId if available
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Authentication failed',
      };
    }

    return {
      success: true,
      token: data.token,
      booking: data.booking,
    };
  } catch (error) {
    console.error('Guest auth error:', error);
    return {
      success: false,
      error: 'Connection error. Please try again.',
    };
  }
};

/**
 * Fetch chat messages (emails + chat messages merged)
 */
export const fetchChatMessages = async (token: string): Promise<ChatMessagesResponse> => {
  try {
    const response = await fetch(`${CHANNEL_MANAGER_URL}/api/public/chat/messages`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // Token expired or invalid
      if (response.status === 401) {
        return {
          success: false,
          error: 'Session expired. Please login again.',
        };
      }
      return {
        success: false,
        error: data.error || 'Failed to load messages',
      };
    }

    return {
      success: true,
      messages: data.messages || [],
    };
  } catch (error) {
    console.error('Fetch messages error:', error);
    return {
      success: false,
      error: 'Connection error. Please try again.',
    };
  }
};

/**
 * Send a chat message from guest to admin
 */
export const sendChatMessage = async (
  token: string,
  message: string
): Promise<SendMessageResponse> => {
  try {
    const response = await fetch(`${CHANNEL_MANAGER_URL}/api/public/chat/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        return {
          success: false,
          error: 'Session expired. Please login again.',
        };
      }
      return {
        success: false,
        error: data.error || 'Failed to send message',
      };
    }

    return {
      success: true,
      message: data.message,
    };
  } catch (error) {
    console.error('Send message error:', error);
    return {
      success: false,
      error: 'Connection error. Please try again.',
    };
  }
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (token: string): Promise<boolean> => {
  try {
    const response = await fetch(`${CHANNEL_MANAGER_URL}/api/public/chat/messages/read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Mark read error:', error);
    return false;
  }
};

/**
 * Decode JWT payload without verification
 * Used for auto-login from email link where token is already trusted
 */
const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = parts[1];
    // Handle base64url encoding
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('JWT decode error:', error);
    return null;
  }
};

/**
 * Get booking info for logged in guest
 * First tries to decode from JWT, falls back to API call
 */
export const fetchBookingInfo = async (token: string): Promise<GuestAuthResponse> => {
  // Try to decode JWT payload directly (for auto-login tokens from email)
  const payload = decodeJwtPayload(token);

  if (payload && payload.bookingId) {
    console.log('📦 Decoded booking info from JWT payload');
    return {
      success: true,
      booking: {
        id: payload.bookingId as string,
        bookingReference: (payload.bookingReference as string) || '',
        guestName: (payload.guestName as string) || 'Guest',
        guestEmail: (payload.guestEmail as string) || '',
        apartmentName: (payload.apartmentName as string) || '',
        checkIn: (payload.checkIn as string) || '',
        checkOut: (payload.checkOut as string) || '',
        numberOfGuests: (payload.numberOfGuests as number) || 1,
        status: 'confirmed',
      },
    };
  }

  // Fallback: try API call for tokens that don't contain booking info
  try {
    const response = await fetch(`${CHANNEL_MANAGER_URL}/api/public/booking/info`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to fetch booking info',
      };
    }

    return {
      success: true,
      booking: data.booking,
    };
  } catch (error) {
    console.error('Fetch booking error:', error);
    return {
      success: false,
      error: 'Connection error',
    };
  }
};
