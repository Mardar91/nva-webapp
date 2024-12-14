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
                    const status = await getSubscriptionStatus();
                    setIsSubscribed(!!status?.isSubscribed);
                    setDeviceId(status?.deviceId || null);
                    setIsLoading(false);
                } catch (err) {
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
