// hooks/useNotifications.ts
import { useState, useEffect } from 'react';
import {
  getDeviceId,
  getSubscriptionStatus,
  requestNotificationPermission,
  isOneSignalAvailable,
    optInToNotifications
} from '../lib/notifications/oneSignal';

export const useNotifications = () => {
    const [isSupported, setIsSupported] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [deviceId, setDeviceId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        const checkSupport = async () => {
            try {
                if (isOneSignalAvailable()) {
                    setIsSupported(true);
                    setIsLoading(false);
                } else {
                    setIsLoading(false);
                    setError('OneSignal is not available.');
                }
            } catch (err) {
                setError('OneSignal initialization error');
                setIsLoading(false);
            }
        };
        checkSupport();
    }, []);

    useEffect(() => {
        if (isSupported) {
            const fetchStatus = async () => {
                try {
                    console.log('[useNotifications DEBUG] 🔄 Fetching subscription status...');
                    const status = await getSubscriptionStatus();
                    console.log('[useNotifications DEBUG] 📊 Status received:', {
                        deviceId: status?.deviceId || 'NULL/UNDEFINED',
                        isSubscribed: status?.isSubscribed,
                        pushToken: status?.pushToken ? 'EXISTS' : 'NULL'
                    });
                    setIsSubscribed(!!status?.isSubscribed);
                    setDeviceId(status?.deviceId || null);
                    setIsLoading(false);
                } catch (err) {
                    console.error('[useNotifications DEBUG] ❌ Error:', err);
                    setError('Error fetching subscription status.');
                    setIsLoading(false);
                }
            };

            fetchStatus();
        }
    }, [isSupported]);

    const requestPermission = async () => {
        if (!isSupported) {
            setError('Notifications are not supported');
            return;
        }

        try {
            const permission = await requestNotificationPermission();
            if (permission){
                setIsSubscribed(true);
                await optInToNotifications();
            }
        } catch (err) {
            setError('Error requesting notification permission.');
        }
    };
    return {
        isSupported,
        isSubscribed,
        deviceId,
        error,
        requestPermission,
        isLoading,
    };
};
