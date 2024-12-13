// hooks/useNotifications.ts
import { useState, useEffect } from 'react';
import {
  getDeviceId,
  getSubscriptionStatus,
  requestNotificationPermission,
  ONE_SIGNAL_CONFIG,
    optInToNotifications,
} from '../lib/notifications/oneSignal';
import { initializeCheckInNotifications } from '../lib/notifications/checkInNotifications';


export const useNotifications = (checkInDate?: Date) => {
    const [isSupported, setIsSupported] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [deviceId, setDeviceId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
      const checkSupport = async () => {
        try {
          if (typeof window !== 'undefined' && !!window.OneSignal) {
            setIsSupported(true);
            await initializeCheckInNotifications();
          }
        } catch (err) {
          setError('OneSignal initialization error');
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
          } catch (err) {
            setError('Error fetching subscription status.');
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
            setIsSubscribed(true)
            await optInToNotifications();
          }
      } catch (err) {
          setError('Error requesting notification permission.');
      }
    };
  
    const setCheckInDate = async (date: Date) => {
      localStorage.setItem('check-in-date', date.toISOString());
    };
  
    return {
      isSupported,
      isSubscribed,
      deviceId,
      error,
      requestPermission,
      setCheckInDate
    };
  };
