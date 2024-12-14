// hooks/useNotifications.ts
import { useState, useEffect, useRef } from 'react';
import {
  getDeviceId,
  getSubscriptionStatus,
  requestNotificationPermission,
  isOneSignalAvailable,
    optInToNotifications
} from '../lib/notifications/oneSignal';
import { initializeCheckInNotifications } from '../lib/notifications/checkInNotifications';

export const useNotifications = () => {
    const [isSupported, setIsSupported] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [deviceId, setDeviceId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const isInitializedRef = useRef(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null); // Ref per controllare il timer

    useEffect(() => {
        const checkSupport = async () => {
            try {
                if (isOneSignalAvailable()) {
                    setIsSupported(true);
                   if (!isInitializedRef.current){
                        await initializeCheckInNotifications(timerRef);
                       isInitializedRef.current = true;
                    }
                    setIsLoading(false); // Imposta a false al termine dell'inizializzazione
                } else {
                    setIsLoading(false); // Imposta a false se OneSignal non è disponibile
                    setError('OneSignal is not available.');
                }
            } catch (err) {
                setError('OneSignal initialization error');
                setIsLoading(false); // Imposta a false anche in caso di errore
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
                    setIsLoading(false); // Imposta a false dopo aver ottenuto lo stato
                } catch (err) {
                    setError('Error fetching subscription status.');
                    setIsLoading(false); // Imposta a false anche in caso di errore
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
        timerRef
    };
};
