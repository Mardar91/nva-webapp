import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Calendar } from "../components/ui/calendar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../components/ui/card";
import { format, differenceInDays } from "date-fns";
import { cn } from "../lib/utils";
import { ChevronDown, ChevronUp, Calendar as CalendarIcon, LogIn } from "lucide-react";
import { useNotifications } from '../hooks/useNotifications';

interface CheckInNotificationState {
  deviceId: string | null;
  notificationSent: boolean;
  lastNotificationDate: string | null;
}

// Custom hook per gestire il salvataggio della data e dello stato di conferma
const usePersistedCheckIn = () => {
  const [checkInDate, setCheckInDate] = useState<Date | null>(() => {
    const saved = localStorage.getItem('check-in-date');
    if (saved) {
      const date = new Date(saved);
      return isNaN(date.getTime()) ? null : date;
    }
    return null;
  });

  const [isConfirmed, setIsConfirmed] = useState<boolean>(() => {
    return localStorage.getItem('check-in-confirmed') === 'true';
  });

  const [notificationState, setNotificationState] = useState<CheckInNotificationState>(() => {
    const saved = localStorage.getItem('check-in-notification-state');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      deviceId: null,
      notificationSent: false,
      lastNotificationDate: null
    };
  });

  useEffect(() => {
    if (checkInDate) {
      localStorage.setItem('check-in-date', checkInDate.toISOString());
    } else {
      localStorage.removeItem('check-in-date');
    }
  }, [checkInDate]);

  useEffect(() => {
    localStorage.setItem('check-in-confirmed', isConfirmed.toString());
  }, [isConfirmed]);

  useEffect(() => {
    localStorage.setItem('check-in-notification-state', JSON.stringify(notificationState));
  }, [notificationState]);

  return {
    checkInDate,
    setCheckInDate,
    isConfirmed,
    setIsConfirmed,
    notificationState,
    setNotificationState
  };
};

const CountdownDisplay = ({ 
  checkInDate, 
  onDayChange 
}: { 
  checkInDate: Date;
  onDayChange: (daysLeft: number) => void;
}) => {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    const calculateDaysLeft = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const days = differenceInDays(checkInDate, today);
      setDaysLeft(days >= 0 ? days : null);
      onDayChange(days);
    };

    calculateDaysLeft();
    const interval = setInterval(calculateDaysLeft, 1000 * 60 * 60); // Controlla ogni ora

    return () => clearInterval(interval);
  }, [checkInDate, onDayChange]);

  if (daysLeft === null) {
    return null;
  }

  return (
    <div className="flex justify-center">
      <div 
        className="px-6 py-3 rounded-full bg-[#ecfdf5]"
        style={{ animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}
      >
        <span className="text-[#059669] font-semibold">
          {daysLeft === 0 
            ? "Your stay at Nonna Vittoria Apartments starts today!" 
            : `Your stay at Nonna Vittoria Apartments in just ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}`}
        </span>
      </div>
    </div>
  );
};

const CheckInButton = ({ date }: { date: Date }) => {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    const checkAvailability = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const days = differenceInDays(date, today);
      setIsAvailable(days >= 0 && days <= 3);
    };

    checkAvailability();
    const interval = setInterval(checkAvailability, 1000 * 60 * 60 * 24);

    return () => clearInterval(interval);
  }, [date]);

  if (!isAvailable) {
    return null;
  }

  return (
    <div className="flex justify-center mt-4 mb-4">
      <Button
        onClick={() => window.location.href = "https://form.jotform.com/221524504539049"}
        className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white flex items-center gap-2"
      >
        <LogIn className="h-4 w-4" />
        Online Check-in Available
      </Button>
    </div>
  );
};
const CheckIn = () => {
  const { 
    checkInDate, 
    setCheckInDate: setStoredCheckInDate, // rinominiamo per evitare conflitti
    isConfirmed, 
    setIsConfirmed,
    notificationState,
    setNotificationState 
  } = usePersistedCheckIn();

  // Aggiungiamo il nostro nuovo hook delle notifiche
  const { 
    isSupported,
    isSubscribed,
    daysUntilCheckIn,
    requestPermission,
    setCheckInDate: setNotificationCheckInDate, // rinominiamo per evitare conflitti
    error: notificationError 
  } = useNotifications(checkInDate);
  
  const [showForm, setShowForm] = useState(false);
  const [dateSelected, setDateSelected] = useState(false);
  const [showCalendar, setShowCalendar] = useState(() => !localStorage.getItem('check-in-confirmed'));

  // Inizializzazione OneSignal e gestione del deviceId
  useEffect(() => {
    const initializeOneSignal = async () => {
      try {
        // @ts-ignore - OneSignal è disponibile globalmente
        if (window.OneSignal) {
          await window.OneSignal.Notifications.requestPermission();
          const deviceState = await window.OneSignal.User.PushSubscription.id;
          if (deviceState && deviceState !== notificationState.deviceId) {
            setNotificationState(prev => ({
              ...prev,
              deviceId: deviceState
            }));
          }
        }
      } catch (error) {
        console.error('Error initializing OneSignal:', error);
      }
    };

    if (!notificationState.deviceId) {
      initializeOneSignal();
    }
  }, [notificationState.deviceId, setNotificationState]);

  // Gestione del countdown e invio notifica
  const handleDayChange = async (daysLeft: number) => {
  if (daysLeft === 1 && !notificationState.notificationSent && notificationState.deviceId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const lastAttempt = sessionStorage.getItem('lastNotificationAttempt');
      const now = Date.now();
      
      if (lastAttempt && now - parseInt(lastAttempt) < 5000) {
        return;
      }
      
      sessionStorage.setItem('lastNotificationAttempt', now.toString());

      if (notificationState.lastNotificationDate !== today) {
        const response = await fetch('/api/check-in-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            deviceId: notificationState.deviceId,
            checkInDate: checkInDate.toISOString() // Aggiungiamo la data del check-in
          })
        });

        if (response.ok) {
          setNotificationState(prev => ({
            ...prev,
            notificationSent: true,
            lastNotificationDate: today
          }));
        }
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }
};

  useEffect(() => {
    if (checkInDate) {
      setDateSelected(true);
    }
  }, [checkInDate]);

  const validateDate = (selectedDate: Date) => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const diffTime = selectedDate.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  };

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (newDate.getTime() >= today.getTime()) {
        setStoredCheckInDate(newDate);
        setNotificationCheckInDate(newDate); // Aggiorniamo anche le notifiche
        setDateSelected(true);
        setIsConfirmed(false);
      } else {
        alert("Please select a future date");
        setStoredCheckInDate(null);
        setDateSelected(false);
        setIsConfirmed(false);
      }
    } else {
      setDateSelected(false);
      setStoredCheckInDate(null);
      setIsConfirmed(false);
    }
  };

  const handleConfirm = () => {
    if (checkInDate) {
      setIsConfirmed(true);
      setShowCalendar(false);
      if (validateDate(checkInDate)) {
        setShowForm(true);
      } else {
        alert(
          "Check-in is only available 3 days before your stay date. Please try again closer to your stay date."
        );
      }
    }
  };

  const disabledDays = {
    before: new Date(),
  };

  if (showForm) {
    return (
      <div className="iframe-container" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: '88px',
        overflow: 'hidden',
        WebkitOverflowScrolling: 'touch',
      }}>
        <iframe
          src="https://form.jotform.com/221524504539049"
          title="Check-in Form"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          scrolling="yes"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      {isConfirmed && checkInDate && (
        <>
          <CountdownDisplay 
            checkInDate={checkInDate} 
            onDayChange={handleDayChange}
          />
          <CheckInButton date={checkInDate} />
          <div className="flex justify-center">
            <Button
              onClick={() => setShowCalendar(!showCalendar)}
              variant="outline"
              className="flex items-center gap-2 text-[#1e3a8a]"
            >
              {showCalendar ? (
                <>
                  Hide Calendar <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  Change Check-in Date <CalendarIcon className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </>
      )}

      {(!isConfirmed || showCalendar) && (
        <Card className={cn("mb-6", isConfirmed ? "mt-4" : "")}>
          <CardHeader>
            <CardTitle className="text-[#1e3a8a]">
              {isConfirmed ? "Change your check-in date" : "Please select your check-in date"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <style>
              {`
                .rdp-day_selected { 
                  background-color: #1e3a8a !important;
                  color: white !important;
                }
                .rdp-day_today { 
                  background-color: #e0e7ff !important;
                  color: #1e3a8a !important;
                }
                .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
                  background-color: #bfdbfe !important;
                  color: #1e3a8a !important;
                }
                .rdp-head_cell {
                  color: #1e3a8a !important;
                  font-weight: 600 !important;
                }
                .rdp-caption_label {
                  color: #1e3a8a !important;
                  font-weight: 600 !important;
                }
                .rdp-nav_button {
                  color: #1e3a8a !important;
                }
                .rdp-button[disabled]:not(.rdp-day_selected) {
                  opacity: 0.5 !important;
                  background-color: #f3f4f6 !important;
                  color: #9ca3af !important;
                  cursor: not-allowed !important;
                }
                .rdp-button[disabled]:hover {
                  background-color: #f3f4f6 !important;
                  cursor: not-allowed !important;
                }
              `}
            </style>
            <Calendar
              mode="single"
              selected={checkInDate || undefined}
              onSelect={handleDateSelect}
              disabled={disabledDays}
              className="rounded-md border"
            />
          </CardContent>
          {dateSelected && checkInDate && (
            <CardFooter className="flex justify-end pb-6">
              <Button 
                onClick={handleConfirm}
                className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white"
              >
                Confirm Check-in Date
              </Button>
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  );
};

export default CheckIn;
