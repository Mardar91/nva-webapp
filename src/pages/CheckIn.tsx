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
  onDayChange: (daysLeft: number, date: Date) => void;
}) => {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    const calculateDaysLeft = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const days = differenceInDays(checkInDate, today);
      setDaysLeft(days >= 0 ? days : null);
      onDayChange(days, checkInDate);
    };

    calculateDaysLeft();
    const interval = setInterval(calculateDaysLeft, 1000 * 60 * 60);

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
