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
 */
export const authenticateGuest = async (
  bookingReference: string,
  email: string
): Promise<GuestAuthResponse> => {
  try {
    const response = await fetch(`${CHANNEL_MANAGER_URL}/api/public/chat/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bookingReference, email }),
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
 * Get booking info for logged in guest
 */
export const fetchBookingInfo = async (token: string): Promise<GuestAuthResponse> => {
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
