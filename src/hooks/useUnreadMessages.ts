// ============================================
// APP: NVA (React App)
// FILE: src/hooks/useUnreadMessages.ts
// PURPOSE: Track unread chat messages count
// ============================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchChatMessages } from '../lib/guestApi';

const POLLING_INTERVAL = 60000; // Check every 60 seconds (when not viewing chat)
const STORAGE_KEY = 'nva_last_read_message_id';

export const useUnreadMessages = (token: string | null, isLoggedIn: boolean) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Get last read message ID from storage
  const getLastReadMessageId = useCallback((): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEY);
  }, []);

  // Mark all messages as read (call this when chat is opened)
  const markAllAsRead = useCallback((latestMessageId?: string) => {
    if (latestMessageId && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, latestMessageId);
    }
    setUnreadCount(0);
  }, []);

  // Check for unread messages
  const checkUnreadMessages = useCallback(async () => {
    if (!token || !isLoggedIn) {
      setUnreadCount(0);
      return;
    }

    try {
      const result = await fetchChatMessages(token);

      if (result.success && result.messages) {
        // Count messages from admin that are not read
        const adminMessages = result.messages.filter(
          msg => msg.senderType === 'admin' || msg.senderType === 'system'
        );

        // Get the last read message ID
        const lastReadId = getLastReadMessageId();

        if (!lastReadId) {
          // First time - count all unread admin messages
          const unread = adminMessages.filter(msg => !msg.isRead).length;
          setUnreadCount(unread);
        } else {
          // Count messages newer than the last read one
          const lastReadIndex = adminMessages.findIndex(msg => msg.id === lastReadId);

          if (lastReadIndex === -1) {
            // Last read message not found, count all unread
            const unread = adminMessages.filter(msg => !msg.isRead).length;
            setUnreadCount(unread);
          } else {
            // Count messages that came after the last read one
            const unread = lastReadIndex; // Messages are sorted newest first
            setUnreadCount(unread);
          }
        }

        // Store the latest message ID for future reference
        if (adminMessages.length > 0) {
          // We don't auto-mark as read here - that happens when chat is opened
        }

        setLastChecked(new Date());
      }
    } catch (error) {
      console.error('Error checking unread messages:', error);
    }
  }, [token, isLoggedIn, getLastReadMessageId]);

  // Start/stop polling based on login status
  useEffect(() => {
    if (isLoggedIn && token) {
      // Initial check
      checkUnreadMessages();

      // Start polling
      pollingRef.current = setInterval(checkUnreadMessages, POLLING_INTERVAL);

      return () => {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
        }
      };
    } else {
      setUnreadCount(0);
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    }
  }, [isLoggedIn, token, checkUnreadMessages]);

  // Listen for chat opened event to mark messages as read
  useEffect(() => {
    const handleChatOpened = async () => {
      if (!token || !isLoggedIn) return;

      // Fetch latest messages and mark all as read
      const result = await fetchChatMessages(token);
      if (result.success && result.messages && result.messages.length > 0) {
        const adminMessages = result.messages.filter(
          msg => msg.senderType === 'admin' || msg.senderType === 'system'
        );
        if (adminMessages.length > 0) {
          markAllAsRead(adminMessages[0].id);
        }
      }
    };

    // Listen for chat drawer open
    window.addEventListener('openGuestChat', handleChatOpened);

    return () => {
      window.removeEventListener('openGuestChat', handleChatOpened);
    };
  }, [token, isLoggedIn, markAllAsRead]);

  return {
    unreadCount,
    lastChecked,
    checkUnreadMessages,
    markAllAsRead
  };
};
