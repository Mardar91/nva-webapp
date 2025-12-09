// ============================================
// 📱 APP: NVA (React App)
// 📄 FILE: src/components/GuestChatDrawer.tsx
// 🔧 PURPOSE: Chat drawer for guest messages
// ============================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from './ui/sheet';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  MessageCircle,
  Send,
  Mail,
  User,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { ChatMessage, fetchChatMessages, sendChatMessage, markMessagesAsRead } from '../lib/guestApi';

interface GuestChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  token: string | null;
  guestName: string | null;
  onSessionExpired: () => void;
}

const POLLING_INTERVAL = 30000; // 30 seconds

const GuestChatDrawer: React.FC<GuestChatDrawerProps> = ({
  isOpen,
  onClose,
  token,
  guestName,
  onSessionExpired,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = useCallback(async (showLoader = true) => {
    if (!token) return;

    if (showLoader) setIsLoading(true);
    setError(null);

    const result = await fetchChatMessages(token);

    if (result.success && result.messages) {
      setMessages(result.messages);
      // Mark messages as read
      await markMessagesAsRead(token);
    } else if (result.error?.includes('expired') || result.error?.includes('Session')) {
      onSessionExpired();
    } else {
      setError(result.error || 'Failed to load messages');
    }

    if (showLoader) setIsLoading(false);
  }, [token, onSessionExpired]);

  // Load messages when drawer opens
  useEffect(() => {
    if (isOpen && token) {
      loadMessages();
    }
  }, [isOpen, token, loadMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // Polling for new messages
  useEffect(() => {
    if (isOpen && token) {
      pollingRef.current = setInterval(() => {
        loadMessages(false);
      }, POLLING_INTERVAL);

      return () => {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
        }
      };
    }
  }, [isOpen, token, loadMessages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !token || isSending) return;

    setIsSending(true);
    setError(null);

    const result = await sendChatMessage(token, newMessage.trim());

    if (result.success) {
      setNewMessage('');
      // Reload messages to get the new one with proper formatting
      await loadMessages(false);
    } else if (result.error?.includes('expired') || result.error?.includes('Session')) {
      onSessionExpired();
    } else {
      setError(result.error || 'Failed to send message');
    }

    setIsSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' }) + ' ' +
        date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const renderMessage = (msg: ChatMessage) => {
    const isGuest = msg.senderType === 'guest';
    const isEmail = msg.type === 'email';

    return (
      <div
        key={msg.id}
        className={`flex ${isGuest ? 'justify-end' : 'justify-start'} mb-3`}
      >
        <div
          className={`max-w-[85%] rounded-lg p-3 ${
            isGuest
              ? 'bg-blue-600 text-white'
              : isEmail
              ? 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
              : 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800'
          }`}
        >
          {/* Header */}
          <div className={`flex items-center gap-2 mb-1 ${
            isGuest ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
          }`}>
            {isEmail ? (
              <Mail className="h-3 w-3" />
            ) : isGuest ? (
              <User className="h-3 w-3" />
            ) : (
              <MessageCircle className="h-3 w-3" />
            )}
            <span className="text-xs font-medium">
              {isGuest ? 'You' : msg.senderName || 'Nonna Vittoria'}
            </span>
            <span className="text-xs">
              {formatDate(msg.createdAt)}
            </span>
          </div>

          {/* Subject for emails */}
          {isEmail && msg.subject && (
            <p className={`text-xs font-semibold mb-1 ${
              isGuest ? 'text-blue-100' : 'text-gray-700 dark:text-gray-300'
            }`}>
              {msg.subject}
            </p>
          )}

          {/* Message content */}
          <p className={`text-sm whitespace-pre-wrap ${
            isGuest
              ? 'text-white'
              : 'text-gray-800 dark:text-gray-200'
          }`}>
            {msg.previewText || msg.message}
          </p>
        </div>
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="p-4 border-b dark:border-gray-800">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-400">
              <MessageCircle className="h-5 w-5" />
              Chat
            </SheetTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => loadMessages()}
              disabled={isLoading}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          {guestName && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Logged in as {guestName}
            </p>
          )}
        </SheetHeader>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-900">
          {isLoading && messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <p>Loading messages...</p>
            </div>
          ) : error && messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <AlertCircle className="h-8 w-8 mb-2 text-red-500" />
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadMessages()}
                className="mt-2"
              >
                Try again
              </Button>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <CheckCircle2 className="h-8 w-8 mb-2 text-green-500" />
              <p className="text-center">No messages yet.</p>
              <p className="text-center text-sm mt-1">
                Send us a message if you need any help!
              </p>
            </div>
          ) : (
            <>
              {messages.map(renderMessage)}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Error banner */}
        {error && messages.length > 0 && (
          <div className="px-4 py-2 bg-red-50 dark:bg-red-900/30 border-t border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </p>
          </div>
        )}

        {/* Input area */}
        <div className="p-4 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSending}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!newMessage.trim() || isSending}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            Messages are checked every 30 seconds
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default GuestChatDrawer;
