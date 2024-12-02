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
import { format, differenceInDays, addDays } from "date-fns";
import { cn } from "../lib/utils";
import { ChevronDown, ChevronUp, Calendar as CalendarIcon, LogIn } from "lucide-react";

// Funzione per pianificare la notifica aggiornata
const scheduleCheckInNotification = async (checkInDate: Date) => {
  try {
    const notificationDate = addDays(checkInDate, -1);
    const now = new Date();
    
    console.log('Scheduling check-in notification:', {
      checkInDate: checkInDate.toISOString(),
      notificationDate: notificationDate.toISOString(),
      currentTime: now.toISOString()
    });
    
    if (notificationDate < now) {
      console.log('Notification date is in the past, skipping');
      return;
    }

    const response = await fetch('/api/send-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scheduleDate: notificationDate.toISOString(),
        immediate: false
      }),
    });

    const responseData = await response.json();
    console.log('Notification API response:', responseData);

    if (!response.ok) {
      throw new Error(`API error: ${JSON.stringify(responseData)}`);
    }

    if (responseData.success) {
      localStorage.setItem('scheduledNotification', JSON.stringify({
        checkInDate: checkInDate.toISOString(),
        notificationDate: notificationDate.toISOString(),
        notificationId: responseData.data?.id
      }));
      console.log('Notification scheduled successfully');
    }

  } catch (error) {
    console.error('Failed to schedule notification:', error);
  }
};

// Funzione per verificare le notifiche pianificate
const checkScheduledNotifications = () => {
  try {
    const scheduledData = localStorage.getItem('scheduledNotification');
    if (scheduledData) {
      const { checkInDate, notificationDate } = JSON.parse(scheduledData);
      const now = new Date();
      const notifDate = new Date(notificationDate);
      
      console.log('Checking scheduled notification:', {
        now: now.toISOString(),
        scheduledFor: notifDate.toISOString()
      });
      
      if (now >= notifDate) {
        console.log('Triggering immediate notification');
        fetch('/api/send-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            immediate: true,
            checkInDate,
            target_channel: "push"
          }),
        }).catch(console.error);
        
        localStorage.removeItem('scheduledNotification');
        console.log('Removed scheduled notification from localStorage');
      }
    }
  } catch (error) {
    console.error('Error checking scheduled notifications:', error);
  }
};
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

  return {
    checkInDate,
    setCheckInDate,
    isConfirmed,
    setIsConfirmed
  };
};

const CountdownDisplay = ({ checkInDate }: { checkInDate: Date }) => {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    const calculateDaysLeft = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const days = differenceInDays(checkInDate, today);
      setDaysLeft(days >= 0 ? days : null);
    };

    calculateDaysLeft();
    const interval = setInterval(calculateDaysLeft, 1000 * 60 * 60 * 24);

    return () => clearInterval(interval);
  }, [checkInDate]);

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
  const { checkInDate, setCheckInDate, isConfirmed, setIsConfirmed } = usePersistedCheckIn();
  const [showForm, setShowForm] = useState(false);
  const [dateSelected, setDateSelected] = useState(false);
  const [showCalendar, setShowCalendar] = useState(() => !localStorage.getItem('check-in-confirmed'));

  useEffect(() => {
    // Controlla all'avvio
    checkScheduledNotifications();
    
    // Controlla ogni ora
    const interval = setInterval(checkScheduledNotifications, 1000 * 60 * 60);
    
    return () => clearInterval(interval);
  }, []);

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
        setCheckInDate(newDate);
        setDateSelected(true);
        setIsConfirmed(false);
      } else {
        alert("Please select a future date");
        setCheckInDate(null);
        setDateSelected(false);
        setIsConfirmed(false);
      }
    } else {
      setDateSelected(false);
      setCheckInDate(null);
      setIsConfirmed(false);
    }
  };

  const handleConfirm = () => {
    if (checkInDate) {
      setIsConfirmed(true);
      setShowCalendar(false);
      
      const daysUntilCheckIn = differenceInDays(checkInDate, new Date());
      
      if (daysUntilCheckIn <= 3) {
        setShowForm(true);
        // Pianifica notifica se manca più di 1 giorno
        if (daysUntilCheckIn > 1) {
          scheduleCheckInNotification(checkInDate);
        }
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
          <CountdownDisplay checkInDate={checkInDate} />
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
