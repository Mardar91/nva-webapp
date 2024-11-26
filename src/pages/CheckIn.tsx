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

// [Previous hooks remain the same...]

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
    // Controlla ogni giorno se il check-in diventa disponibile
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

  // [Previous code remains the same until return statement...]

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
              `}
            </style>
            <Calendar
              mode="single"
              selected={checkInDate || undefined}
              onSelect={handleDateSelect}
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
